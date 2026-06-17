import hashlib
import logging
from datetime import timedelta
from typing import Any
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.access.models import Session
from apps.analytics.models import AnalyticsEvent
from apps.users.constants import DEFAULT_SIGNUP_ROLE
from apps.users.models import Role, User, UserRole, UserStatus
from apps.users.selectors import (
    get_user_permissions,
    get_user_roles,
    invalidate_user_permissions_cache,
)

logger = logging.getLogger(__name__)

MAX_LOGIN_ATTEMPTS = 5
LOCK_WINDOW_MINUTES = 15


def _get_refresh_lifetime_seconds() -> int:
    return int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())


def _get_access_lifetime_seconds() -> int:
    return int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())


def _token_hash(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _build_claims(*, user: User) -> dict[str, Any]:
    return {
        "user_id": user.id,
        "email": user.email,
        "username": user.username,
        "roles": get_user_roles(user=user),
        "permissions": get_user_permissions(user=user),
    }


def _apply_claims(*, token: Any, claims: dict[str, Any]) -> None:
    for key, value in claims.items():
        token[key] = value


def _public_user_payload(*, user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "is_verified": user.is_verified,
        "roles": get_user_roles(user=user),
        "permissions": get_user_permissions(user=user),
    }


def _build_auth_payload(*, user: User, refresh: RefreshToken) -> dict[str, Any]:
    access = refresh.access_token
    claims = _build_claims(user=user)
    _apply_claims(token=access, claims=claims)
    return {
        "access_token": str(access),
        "refresh_token": str(refresh),
        "token_type": "Bearer",
        "expires_in": _get_access_lifetime_seconds(),
        "user": _public_user_payload(user=user),
    }


def _ensure_user_can_authenticate(*, user: User) -> None:
    now = timezone.now()
    if user.locked_until and user.locked_until > now:
        raise ValidationError({"credentials": ["Conta temporariamente bloqueada."]})
    if not user.is_active or user.status in (UserStatus.BANNED, UserStatus.SUSPENDED):
        raise PermissionDenied({"account": ["Conta indisponivel para login."]})


@transaction.atomic
def create_user(
    *,
    email: str,
    username: str,
    full_name: str,
    password: str,
    **extra_fields: Any,
) -> User:
    user = User.objects.create_user(
        email=email,
        username=username,
        full_name=full_name,
        password=password,
        **extra_fields,
    )
    default_role, _ = Role.objects.get_or_create(
        name=DEFAULT_SIGNUP_ROLE,
        defaults={"description": "Default signup role"},
    )
    UserRole.objects.get_or_create(user=user, role=default_role)
    invalidate_user_permissions_cache(user=user)
    
    send_verification_email(user=user)
    
    return user


@transaction.atomic
def assign_role(*, user: User, role_name: str) -> UserRole:
    role = Role.objects.get(name=role_name)
    user_role, _ = UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)
    return user_role


@transaction.atomic
def authenticate_user(
    *,
    email: str,
    password: str,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    normalized_email = get_user_model().objects.normalize_email(email)
    user = User.objects.filter(email=normalized_email).first()
    if user is None:
        raise ValidationError({"credentials": ["Email ou password invalidos."]})

    _ensure_user_can_authenticate(user=user)

    if not user.check_password(password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
            user.locked_until = timezone.now() + timedelta(minutes=LOCK_WINDOW_MINUTES)
            user.failed_login_attempts = 0
        user.save(update_fields=["failed_login_attempts", "locked_until", "updated_at"])
        AnalyticsEvent.objects.create(
            user=user,
            event_type="auth.login_failed",
            metadata={"email": normalized_email},
            ip_address=ip_address,
        )
        raise ValidationError({"credentials": ["Email ou password invalidos."]})

    return issue_auth_tokens_for_user(
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        event_type="auth.login_success",
        reset_failed_attempts=True,
    )


@transaction.atomic
def issue_auth_tokens_for_user(
    *,
    user: User,
    ip_address: str = "",
    user_agent: str = "",
    event_type: str = "auth.login_success",
    metadata: dict[str, Any] | None = None,
    reset_failed_attempts: bool = False,
) -> dict[str, Any]:
    _ensure_user_can_authenticate(user=user)

    refresh = RefreshToken.for_user(user)
    payload = _build_auth_payload(user=user, refresh=refresh)

    Session.objects.create(
        user=user,
        token=_token_hash(str(refresh)),
        refresh_jti=str(refresh["jti"]),
        ip_address=ip_address,
        user_agent=user_agent[:1000],
        expires_at=timezone.now() + timedelta(seconds=_get_refresh_lifetime_seconds()),
    )

    update_fields = ["last_seen", "last_login_ip", "is_online", "updated_at"]
    if reset_failed_attempts:
        user.failed_login_attempts = 0
        user.locked_until = None
        update_fields.extend(["failed_login_attempts", "locked_until"])

    user.last_seen = timezone.now()
    user.last_login_ip = ip_address
    user.is_online = True
    user.save(update_fields=update_fields)

    event_metadata = {"session_jti": str(refresh["jti"])}
    if metadata:
        event_metadata.update(metadata)

    AnalyticsEvent.objects.create(
        user=user,
        event_type=event_type,
        metadata=event_metadata,
        ip_address=ip_address,
    )
    logger.info("User authenticated", extra={"user_id": user.id, "event_type": event_type})
    return payload


@transaction.atomic
def refresh_user_tokens(
    *,
    refresh_token: str,
    ip_address: str = "",
    user_agent: str = "",
) -> dict[str, Any]:
    try:
        refresh = RefreshToken(refresh_token)
    except TokenError as exc:
        raise ValidationError({"refresh_token": ["Refresh token invalido."]}) from exc
    user = User.objects.get(id=refresh["user_id"])
    _ensure_user_can_authenticate(user=user)

    old_jti = str(refresh["jti"])
    refresh.blacklist()

    Session.objects.filter(user=user, refresh_jti=old_jti, is_active=True).update(
        is_active=False,
        revoked_at=timezone.now(),
    )

    new_refresh = RefreshToken.for_user(user)
    Session.objects.create(
        user=user,
        token=_token_hash(str(new_refresh)),
        refresh_jti=str(new_refresh["jti"]),
        ip_address=ip_address,
        user_agent=user_agent[:1000],
        expires_at=timezone.now() + timedelta(seconds=_get_refresh_lifetime_seconds()),
    )
    AnalyticsEvent.objects.create(
        user=user,
        event_type="auth.token_refreshed",
        metadata={"old_jti": old_jti, "new_jti": str(new_refresh["jti"])},
        ip_address=ip_address,
    )
    return _build_auth_payload(user=user, refresh=new_refresh)


@transaction.atomic
def logout_user(*, user: User, refresh_token: str | None = None, ip_address: str = "") -> None:
    revoked_at = timezone.now()
    if refresh_token:
        try:
            refresh = RefreshToken(refresh_token)
        except TokenError as exc:
            raise ValidationError({"refresh_token": ["Refresh token invalido."]}) from exc
        refresh.blacklist()
        Session.objects.filter(user=user, refresh_jti=str(refresh["jti"]), is_active=True).update(
            is_active=False,
            revoked_at=revoked_at,
        )
    else:
        Session.objects.filter(user=user, is_active=True).update(
            is_active=False,
            revoked_at=revoked_at,
        )

    user.is_online = False
    user.last_seen = revoked_at
    user.save(update_fields=["is_online", "last_seen", "updated_at"])
    AnalyticsEvent.objects.create(user=user, event_type="auth.logout", ip_address=ip_address)


@transaction.atomic
def change_user_password(*, user: User, current_password: str, new_password: str) -> None:
    if not user.check_password(current_password):
        raise ValidationError({"current_password": ["Password atual invalido."]})
    validate_password(new_password, user=user)
    user.set_password(new_password)
    user.save(update_fields=["password", "updated_at"])
    AnalyticsEvent.objects.create(user=user, event_type="auth.password_changed")


def request_password_reset(*, email: str, request_origin: str = "") -> None:
    normalized_email = get_user_model().objects.normalize_email(email)
    user = User.objects.filter(email=normalized_email, is_active=True).first()
    if user is None:
        return

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
    query = urlencode({"uid": uid, "token": token})
    reset_url = (
        f"{frontend_url}/reset-password?{query}"
        if frontend_url
        else f"/reset-password?{query}"
    )

    context = {
        "full_name": user.full_name,
        "reset_url": reset_url,
    }
    html_content = render_to_string("emails/reset_password.html", context)

    send_mail(
        subject=f"{settings.APP_NAME}: Redefinição de senha",
        message=f"Use este link para redefinir sua senha: {reset_url}",
        from_email=None,
        recipient_list=[user.email],
        html_message=html_content,
        fail_silently=False,
    )
    AnalyticsEvent.objects.create(
        user=user,
        event_type="auth.password_reset_requested",
        metadata={"origin": request_origin},
    )


def send_verification_email(*, user: User, request_origin: str = "") -> None:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
    query = urlencode({"uid": uid, "token": token})
    verification_url = (
        f"{frontend_url}/verify-user?{query}"
        if frontend_url
        else f"/verify-user?{query}"
    )

    context = {
        "full_name": user.full_name,
        "verification_url": verification_url,
    }
    html_content = render_to_string("emails/verification.html", context)

    send_mail(
        subject=f"{settings.APP_NAME}: Verificação de E-mail",
        message=f"Acesse o link para verificar sua conta: {verification_url}",
        from_email=None,
        recipient_list=[user.email],
        html_message=html_content,
        fail_silently=False,
    )
    AnalyticsEvent.objects.create(
        user=user,
        event_type="auth.verification_email_sent",
        metadata={"origin": request_origin},
    )


@transaction.atomic
def reset_user_password(*, uid: str, token: str, new_password: str) -> None:
    user_id = force_str(urlsafe_base64_decode(uid))
    user = User.objects.get(pk=user_id, is_active=True)
    if not default_token_generator.check_token(user, token):
        raise ValidationError({"token": ["Token de redefinicao invalido."]})
    validate_password(new_password, user=user)
    user.set_password(new_password)
    user.save(update_fields=["password", "updated_at"])
    AnalyticsEvent.objects.create(user=user, event_type="auth.password_reset_completed")


@transaction.atomic
def verify_user_email(*, uid: str, token: str) -> None:
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        raise ValidationError({"token": ["Token de verificação inválido ou usuário não encontrado."]})

    if not default_token_generator.check_token(user, token):
        raise ValidationError({"token": ["Token de verificação inválido ou expirado."]})

    if not user.is_verified:
        user.is_verified = True
        user.save(update_fields=["is_verified", "updated_at"])
        AnalyticsEvent.objects.create(user=user, event_type="auth.email_verified")
