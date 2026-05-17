import logging
import secrets
from typing import Any

import requests
from django.conf import settings
from django.db import transaction
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from apps.access.models import OAuthAccount, OAuthProvider
from core.users.models import Role, User, UserRole
from core.users.selectors import invalidate_user_permissions_cache
from core.users.constants import DEFAULT_SIGNUP_ROLE
from core.users.services import assign_role, issue_auth_tokens_for_user

logger = logging.getLogger(__name__)

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _unique_username(base: str) -> str:
    normalized = slugify(base)[:40] or "user"
    candidate = normalized
    suffix = 1
    while User.objects.filter(username__iexact=candidate).exists():
        suffix += 1
        candidate = f"{normalized}{suffix}"
    return candidate


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


def _validate_google_profile(*, profile: dict[str, Any]) -> dict[str, Any]:
    email = profile.get("email", "").strip()
    provider_user_id = profile.get("sub", "").strip()
    if not email or not provider_user_id:
        raise ValidationError({"access_token": ["Perfil Google incompleto."]})
    if not profile.get("email_verified"):
        raise ValidationError({"access_token": ["Email Google nao verificado."]})
    return profile


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
