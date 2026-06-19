from typing import Any

from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.users.authorization_service import (
    invalidate_user_role_cache,
    log_permission_audit,
    user_has_permission,
    user_is_super_admin,
)
from apps.users.constants import DEFAULT_SIGNUP_ROLE
from apps.users.models import Role, User, UserRole, UserStatus
from apps.users.selectors import get_user_roles
from apps.users.services import send_verification_email


@transaction.atomic
def create_managed_user(
    *,
    actor: User,
    email: str,
    username: str,
    full_name: str,
    password: str,
    role_names: list[str] | None = None,
    ip_address: str = "",
    **extra_fields: Any,
) -> User:
    if not user_has_permission(user=actor, permission_name="user.create"):
        raise PermissionDenied({"permission": ["Permissao user.create necessaria."]})

    validate_password(password)
    user = User.objects.create_user(
        email=email,
        username=username,
        full_name=full_name,
        password=password,
        **extra_fields,
    )
    resolved_roles = role_names or [DEFAULT_SIGNUP_ROLE]
    _set_user_roles(user=user, role_names=resolved_roles)

    log_permission_audit(
        actor=actor,
        target_user=user,
        action="user.created",
        resource_type="user",
        resource_id=user.id,
        metadata={"roles": resolved_roles},
        ip_address=ip_address,
    )
    
    send_verification_email(user=user)
    
    return user


@transaction.atomic
def update_managed_user(
    *,
    actor: User,
    user: User,
    data: dict[str, Any],
    ip_address: str = "",
) -> User:
    is_self = actor.id == user.id
    if not is_self and not user_has_permission(user=actor, permission_name="user.update"):
        raise PermissionDenied({"permission": ["Permissao user.update necessaria."]})

    role_names = data.pop("role_names", None)
    updatable_fields = {
        "username",
        "full_name",
        "avatar_url",
        "bio",
        "is_verified",
        "status",
        "is_active",
    }
    if not is_self and not user_is_super_admin(user=actor):
        updatable_fields -= {"status", "is_active", "is_verified"}

    for field, value in data.items():
        if field in updatable_fields:
            setattr(user, field, value)

    user.save()
    if role_names is not None:
        if not user_has_permission(user=actor, permission_name="role.manage"):
            raise PermissionDenied({"permission": ["Permissao role.manage necessaria."]})
        _set_user_roles(user=user, role_names=role_names)

    invalidate_user_role_cache(user=user)
    log_permission_audit(
        actor=actor,
        target_user=user,
        action="user.updated",
        resource_type="user",
        resource_id=user.id,
        metadata={"fields": list(data.keys()), "roles": role_names},
        ip_address=ip_address,
    )
    return user


@transaction.atomic
def ban_user(*, actor: User, user: User, status: str, ip_address: str = "") -> User:
    if not user_has_permission(user=actor, permission_name="user.ban"):
        raise PermissionDenied({"permission": ["Permissao user.ban necessaria."]})
    if status not in (UserStatus.BANNED, UserStatus.SUSPENDED, UserStatus.ACTIVE):
        raise ValidationError({"status": ["Status invalido para banimento."]})

    user.status = status
    user.is_active = status == UserStatus.ACTIVE
    user.is_online = False
    user.save(update_fields=["status", "is_active", "is_online", "updated_at"])

    log_permission_audit(
        actor=actor,
        target_user=user,
        action="user.ban_status_changed",
        resource_type="user",
        resource_id=user.id,
        metadata={"status": status},
        ip_address=ip_address,
    )
    return user


@transaction.atomic
def soft_delete_user(*, actor: User, user: User, ip_address: str = "") -> User:
    if not user_has_permission(user=actor, permission_name="user.delete"):
        raise PermissionDenied({"permission": ["Permissao user.delete necessaria."]})
    if actor.id == user.id:
        raise ValidationError({"user": ["Nao e possivel remover a propria conta por este endpoint."]})

    user.mark_deleted()
    user.is_active = False
    user.is_online = False
    user.save(update_fields=["is_deleted", "deleted_at", "is_active", "is_online", "updated_at"])

    log_permission_audit(
        actor=actor,
        target_user=user,
        action="user.soft_deleted",
        resource_type="user",
        resource_id=user.id,
        ip_address=ip_address,
    )
    return user


def _set_user_roles(*, user: User, role_names: list[str]) -> None:
    roles = list(Role.objects.filter(name__in=role_names))
    if len(roles) != len(set(role_names)):
        found = {role.name for role in roles}
        missing = sorted(set(role_names) - found)
        raise ValidationError({"role_names": [f"Roles invalidas: {', '.join(missing)}"]})

    UserRole.objects.filter(user=user).exclude(role__in=roles).delete()
    for role in roles:
        UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_role_cache(user=user)


def serialize_user_detail(*, user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "status": user.status,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
        "is_online": user.is_online,
        "roles": get_user_roles(user=user),
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
