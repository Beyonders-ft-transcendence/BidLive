from typing import Any

from django.core.cache import cache
from rest_framework.request import Request

from apps.analytics.models import AnalyticsEvent
from apps.users.constants import ROLE_SUPER_ADMIN
from apps.users.models import PermissionAuditLog, User
from apps.users.selectors import get_user_permissions, get_user_roles, invalidate_user_permissions_cache

ROLE_CACHE_TTL = 300


def get_cached_user_roles(*, user: User) -> list[str]:
    cache_key = f"user:{user.id}:roles"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached
    roles = get_user_roles(user=user)
    cache.set(cache_key, roles, timeout=ROLE_CACHE_TTL)
    return roles


def invalidate_user_role_cache(*, user: User) -> None:
    cache.delete(f"user:{user.id}:roles")
    invalidate_user_permissions_cache(user=user)


def user_has_role(*, user: User, role_name: str) -> bool:
    return role_name in get_cached_user_roles(user=user)


def user_is_super_admin(*, user: User) -> bool:
    return user_has_role(user=user, role_name=ROLE_SUPER_ADMIN) or user.is_superuser


def user_has_permission(*, user: User, permission_name: str) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user_is_super_admin(user=user):
        return True
    return permission_name in get_user_permissions(user=user)


def user_has_any_permission(*, user: User, permission_names: list[str]) -> bool:
    return any(user_has_permission(user=user, permission_name=name) for name in permission_names)


def user_has_all_permissions(*, user: User, permission_names: list[str]) -> bool:
    return all(user_has_permission(user=user, permission_name=name) for name in permission_names)


def log_permission_audit(
    *,
    actor: User | None,
    action: str,
    resource_type: str = "",
    resource_id: str = "",
    target_user: User | None = None,
    metadata: dict[str, Any] | None = None,
    ip_address: str = "",
) -> None:
    PermissionAuditLog.objects.create(
        actor=actor,
        target_user=target_user,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else "",
        metadata=metadata or {},
        ip_address=ip_address,
    )
    AnalyticsEvent.objects.create(
        user=actor,
        event_type=action,
        metadata={
            "resource_type": resource_type,
            "resource_id": resource_id,
            "target_user_id": target_user.id if target_user else None,
            **(metadata or {}),
        },
        ip_address=ip_address,
    )


def log_access_denied(*, request: Request, permission_name: str, view_name: str = "") -> None:
    user = request.user if request.user.is_authenticated else None
    log_permission_audit(
        actor=user,
        action="auth.access_denied",
        resource_type="permission",
        resource_id=permission_name,
        metadata={"view": view_name, "path": request.path, "method": request.method},
        ip_address=_client_ip(request),
    )


def _client_ip(request: Request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


ROLE_LEVELS = {
    "SUPER_ADMIN": 4,
    "MONITOR": 3,
    "USER": 2,
    "VISITOR": 1,
}


def get_user_level(user: User) -> int:
    if user.is_superuser:
        return 5
    roles = get_cached_user_roles(user=user)
    if not roles:
        return 0
    return max(ROLE_LEVELS.get(role, 0) for role in roles)

