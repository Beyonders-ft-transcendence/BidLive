import logging
import secrets
from typing import Any
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from apps.access.models import OAuthAccount, OAuthProvider
from apps.analytics.models import AnalyticsEvent
from core.users.constants import DEFAULT_SIGNUP_ROLE
from core.users.models import Role, User, UserRole
from core.users.selectors import invalidate_user_permissions_cache
from core.users.services import assign_role, issue_auth_tokens_for_user

logger = logging.getLogger(__name__)

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
FORTY_TWO_AUTHORIZE_URL = "https://api.intra.42.fr/oauth/authorize"
FORTY_TWO_TOKEN_URL = "https://api.intra.42.fr/oauth/token"
FORTY_TWO_ME_URL = "https://api.intra.42.fr/v2/me"
FORTY_TWO_STATE_TTL = 600


def _unique_username(base: str) -> str:
    normalized = slugify(base)[:40] or "user"
    candidate = normalized
    suffix = 1
    while User.objects.filter(username__iexact=candidate).exists():
        suffix += 1
        candidate = f"{normalized}{suffix}"
    return candidate


def _scopes_to_string(raw_scopes: str | list[str] | tuple[str, ...]) -> str:
    if isinstance(raw_scopes, str):
        return " ".join(part for part in raw_scopes.split() if part)
    return " ".join(part for part in raw_scopes if part)


def _store_42_state(*, state: str, redirect_uri: str, scopes: str) -> None:
    cache.set(
        f"oauth42:state:{state}",
        {"redirect_uri": redirect_uri, "scopes": scopes},
        timeout=FORTY_TWO_STATE_TTL,
    )


def _consume_42_state(*, state: str) -> dict[str, str] | None:
    cache_key = f"oauth42:state:{state}"
    payload = cache.get(cache_key)
    if payload is not None:
        cache.delete(cache_key)
    return payload


def _log_42_failure(*, reason: str, ip_address: str = "", metadata: dict[str, Any] | None = None) -> None:
    AnalyticsEvent.objects.create(
        event_type="auth.42_login_failed",
        metadata={"reason": reason, **(metadata or {})},
        ip_address=ip_address,
    )


def build_42_authorization_url(*, redirect_uri: str | None = None) -> dict[str, Any]:
    if not settings.FORTY_TWO_CLIENT_ID:
        raise ValidationError({"oauth": ["OAuth42 nao configurado no servidor."]})

    resolved_redirect = redirect_uri or settings.FORTY_TWO_REDIRECT_URI
    scopes = _scopes_to_string(settings.FORTY_TWO_SCOPES)
    state = secrets.token_urlsafe(32)
    _store_42_state(state=state, redirect_uri=resolved_redirect, scopes=scopes)
    query = urlencode(
        {
            "client_id": settings.FORTY_TWO_CLIENT_ID,
            "redirect_uri": resolved_redirect,
            "response_type": "code",
            "scope": scopes,
            "state": state,
        }
    )
    return {
        "authorization_url": f"{FORTY_TWO_AUTHORIZE_URL}?{query}",
        "state": state,
        "expires_in": FORTY_TWO_STATE_TTL,
    }


def _fetch_google_profile_from_access_token(*, access_token: str) -> dict[str, Any]:
    response = requests.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    if response.status_code != 200:
        raise ValidationError({"access_token": ["Token Google invalido ou expirado."]})
    return response.json()


def _fetch_google_profile_from_id_token(*, id_token: str) -> dict[str, Any]:
    response = requests.get(
        GOOGLE_TOKENINFO_URL,
        params={"id_token": id_token},
        timeout=10,
    )
    if response.status_code != 200:
        raise ValidationError({"id_token": ["ID token Google invalido ou expirado."]})

    data = response.json()
    if settings.GOOGLE_CLIENT_ID and data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise ValidationError({"id_token": ["ID token nao pertence a este cliente OAuth."]})

    return {
        "sub": data.get("sub", ""),
        "email": data.get("email", ""),
        "email_verified": data.get("email_verified") in (True, "true"),
        "name": data.get("name", ""),
        "picture": data.get("picture", ""),
    }


def exchange_google_authorization_code(*, code: str, redirect_uri: str) -> str:
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise ValidationError({"code": ["Google OAuth nao configurado no servidor."]})

    response = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    if response.status_code != 200:
        logger.warning("Google code exchange failed", extra={"status": response.status_code})
        raise ValidationError({"code": ["Codigo de autorizacao Google invalido ou expirado."]})

    access_token = response.json().get("access_token")
    if not access_token:
        raise ValidationError({"code": ["Google nao retornou access_token."]})
    return access_token


def exchange_42_authorization_code(*, code: str, redirect_uri: str) -> dict[str, Any]:
    if not settings.FORTY_TWO_CLIENT_ID or not settings.FORTY_TWO_CLIENT_SECRET:
        raise ValidationError({"code": ["OAuth42 nao configurado no servidor."]})

    try:
        response = requests.post(
            FORTY_TWO_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.FORTY_TWO_CLIENT_ID,
                "client_secret": settings.FORTY_TWO_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            timeout=10,
        )
    except requests.RequestException as exc:
        logger.warning("42 code exchange failed", exc_info=exc)
        raise ValidationError({"code": ["Nao foi possivel comunicar com a API da 42."]}) from exc

    if response.status_code != 200:
        logger.warning("42 code exchange failed", extra={"status": response.status_code})
        raise ValidationError({"code": ["Codigo de autorizacao 42 invalido ou expirado."]})

    payload = response.json()
    if not payload.get("access_token"):
        raise ValidationError({"code": ["A 42 nao retornou access_token."]})
    return payload


def _validate_google_profile(*, profile: dict[str, Any]) -> dict[str, Any]:
    email = profile.get("email", "").strip()
    provider_user_id = profile.get("sub", "").strip()
    if not email or not provider_user_id:
        raise ValidationError({"access_token": ["Perfil Google incompleto."]})
    if not profile.get("email_verified"):
        raise ValidationError({"access_token": ["Email Google nao verificado."]})
    return profile


def _extract_42_avatar(profile: dict[str, Any]) -> str:
    if profile.get("image_url"):
        return profile["image_url"]
    image = profile.get("image")
    if isinstance(image, dict):
        if image.get("link"):
            return image["link"]
        versions = image.get("versions")
        if isinstance(versions, dict):
            return versions.get("medium") or versions.get("small") or versions.get("large") or ""
    return ""


def _validate_42_profile(*, profile: dict[str, Any]) -> dict[str, Any]:
    provider_user_id = str(profile.get("id", "")).strip()
    email = (profile.get("email") or "").strip()
    login = (profile.get("login") or "").strip()
    display_name = (profile.get("displayname") or profile.get("usual_full_name") or "").strip()
    if not provider_user_id or not email or not login:
        raise ValidationError({"account": ["Perfil 42 incompleto para autenticacao."]})
    return {
        "provider_user_id": provider_user_id,
        "email": User.objects.normalize_email(email),
        "login": login,
        "display_name": display_name or login,
        "avatar_url": _extract_42_avatar(profile),
    }


def _fetch_42_profile(*, access_token: str) -> dict[str, Any]:
    try:
        response = requests.get(
            FORTY_TWO_ME_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
    except requests.RequestException as exc:
        logger.warning("42 profile fetch failed", exc_info=exc)
        raise ValidationError({"account": ["Nao foi possivel comunicar com a API da 42."]}) from exc

    if response.status_code != 200:
        raise ValidationError({"access_token": ["Token da 42 invalido ou expirado."]})
    return response.json()


@transaction.atomic
def _get_or_create_user_for_google(*, profile: dict[str, Any]) -> User:
    email = User.objects.normalize_email(profile["email"])
    provider_user_id = profile["sub"]

    oauth_account = (
        OAuthAccount.objects.select_related("user")
        .filter(provider=OAuthProvider.GOOGLE, provider_user_id=provider_user_id)
        .first()
    )
    if oauth_account:
        return oauth_account.user

    user = User.objects.filter(email=email).first()
    if user is None:
        username = _unique_username(profile.get("given_name") or email.split("@")[0])
        user = User.objects.create_user(
            email=email,
            username=username,
            full_name=profile.get("name") or username,
            password=secrets.token_urlsafe(32),
            avatar_url=profile.get("picture", ""),
            is_verified=True,
        )
        default_role, _ = Role.objects.get_or_create(
            name=DEFAULT_SIGNUP_ROLE,
            defaults={"description": "Default signup role"},
        )
        UserRole.objects.get_or_create(user=user, role=default_role)
        invalidate_user_permissions_cache(user=user)
    else:
        assign_role(user=user, role_name=DEFAULT_SIGNUP_ROLE)

    return user


@transaction.atomic
def _get_or_create_user_for_42(*, profile: dict[str, Any]) -> User:
    oauth_account = (
        OAuthAccount.objects.select_related("user")
        .filter(provider=OAuthProvider.FORTY_TWO, provider_user_id=profile["provider_user_id"])
        .first()
    )
    if oauth_account:
        return oauth_account.user

    user = User.objects.filter(email=profile["email"]).first()
    if user is None:
        user = User.objects.create_user(
            email=profile["email"],
            username=_unique_username(profile["login"]),
            full_name=profile["display_name"],
            password=secrets.token_urlsafe(32),
            avatar_url=profile["avatar_url"],
            is_verified=True,
        )
        default_role, _ = Role.objects.get_or_create(
            name=DEFAULT_SIGNUP_ROLE,
            defaults={"description": "Default signup role"},
        )
        UserRole.objects.get_or_create(user=user, role=default_role)
        invalidate_user_permissions_cache(user=user)
    else:
        assign_role(user=user, role_name=DEFAULT_SIGNUP_ROLE)
        updated_fields: list[str] = []
        if not user.avatar_url and profile["avatar_url"]:
            user.avatar_url = profile["avatar_url"]
            updated_fields.append("avatar_url")
        if not user.full_name and profile["display_name"]:
            user.full_name = profile["display_name"]
            updated_fields.append("full_name")
        if not user.is_verified:
            user.is_verified = True
            updated_fields.append("is_verified")
        if updated_fields:
            user.save(update_fields=[*updated_fields, "updated_at"])

    return user


@transaction.atomic
def _link_google_oauth_account(*, user: User, profile: dict[str, Any], access_token: str) -> None:
    provider_user_id = profile["sub"]
    conflicting = OAuthAccount.objects.filter(
        provider=OAuthProvider.GOOGLE,
        provider_user_id=provider_user_id,
    ).exclude(user=user)
    if conflicting.exists():
        raise ValidationError({"account": ["Esta conta Google ja esta vinculada a outro usuario."]})

    OAuthAccount.objects.update_or_create(
        user=user,
        provider=OAuthProvider.GOOGLE,
        defaults={
            "provider_user_id": provider_user_id,
            "access_token": access_token,
        },
    )


@transaction.atomic
def _link_42_oauth_account(
    *,
    user: User,
    profile: dict[str, Any],
    access_token: str,
    refresh_token: str = "",
) -> None:
    provider_user_id = profile["provider_user_id"]
    conflicting = OAuthAccount.objects.filter(
        provider=OAuthProvider.FORTY_TWO,
        provider_user_id=provider_user_id,
    ).exclude(user=user)
    if conflicting.exists():
        raise ValidationError({"account": ["Esta conta 42 ja esta vinculada a outro usuario."]})

    OAuthAccount.objects.update_or_create(
        user=user,
        provider=OAuthProvider.FORTY_TWO,
        defaults={
            "provider_user_id": provider_user_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
        },
    )
    AnalyticsEvent.objects.create(
        user=user,
        event_type="auth.42_account_linked",
        metadata={"provider_user_id": provider_user_id},
    )


@transaction.atomic
def authenticate_google_user(
    *,
    access_token: str,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    profile = _validate_google_profile(
        profile=_fetch_google_profile_from_access_token(access_token=access_token)
    )
    user = _get_or_create_user_for_google(profile=profile)
    _link_google_oauth_account(user=user, profile=profile, access_token=access_token)

    return issue_auth_tokens_for_user(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        event_type="auth.google_login_success",
        metadata={"provider": OAuthProvider.GOOGLE},
        reset_failed_attempts=True,
    )


@transaction.atomic
def authenticate_google_with_id_token(
    *,
    id_token: str,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    profile = _validate_google_profile(profile=_fetch_google_profile_from_id_token(id_token=id_token))
    user = _get_or_create_user_for_google(profile=profile)
    _link_google_oauth_account(user=user, profile=profile, access_token=id_token)

    return issue_auth_tokens_for_user(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        event_type="auth.google_login_success",
        metadata={"provider": OAuthProvider.GOOGLE, "via": "id_token"},
        reset_failed_attempts=True,
    )


def authenticate_google_with_code(
    *,
    code: str,
    redirect_uri: str | None = None,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    resolved_redirect = redirect_uri or settings.GOOGLE_CALLBACK_URL
    access_token = exchange_google_authorization_code(code=code, redirect_uri=resolved_redirect)
    return authenticate_google_user(
        access_token=access_token,
        ip_address=ip_address,
        user_agent=user_agent,
    )


def authenticate_42_with_code(
    *,
    code: str,
    state: str,
    redirect_uri: str | None = None,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    state_payload = _consume_42_state(state=state)
    if state_payload is None:
        _log_42_failure(reason="invalid_state", ip_address=ip_address)
        raise ValidationError({"state": ["State invalido ou expirado."]})

    resolved_redirect = redirect_uri or state_payload["redirect_uri"] or settings.FORTY_TWO_REDIRECT_URI
    if resolved_redirect != state_payload["redirect_uri"]:
        _log_42_failure(reason="redirect_mismatch", ip_address=ip_address)
        raise ValidationError({"redirect_uri": ["Redirect URI nao confere com a autorizacao iniciada."]})

    try:
        token_payload = exchange_42_authorization_code(code=code, redirect_uri=resolved_redirect)
        profile = _validate_42_profile(
            profile=_fetch_42_profile(access_token=token_payload["access_token"])
        )
        user = _get_or_create_user_for_42(profile=profile)
        _link_42_oauth_account(
            user=user,
            profile=profile,
            access_token=token_payload["access_token"],
            refresh_token=token_payload.get("refresh_token", ""),
        )
    except ValidationError as exc:
        _log_42_failure(reason="oauth_error", ip_address=ip_address, metadata={"errors": exc.detail})
        raise

    return issue_auth_tokens_for_user(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        event_type="auth.42_login_success",
        metadata={"provider": OAuthProvider.FORTY_TWO},
        reset_failed_attempts=True,
    )
