from django.core.cache import cache
from django.db.models import QuerySet

from core.users.models import User, UserStatus

PERMISSIONS_CACHE_TTL = 300


def get_user_by_email(*, email: str) -> User:
    return User.objects.get(email=email)


def active_users() -> QuerySet[User]:
    return User.objects.filter(is_active=True, status=UserStatus.ACTIVE)


def get_user_roles(*, user: User) -> list[str]:
    return list(user.roles.values_list("name", flat=True).order_by("name"))


def get_user_permissions(*, user: User, use_cache: bool = True) -> list[str]:
    cache_key = f"user:{user.id}:permissions"
    if use_cache:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

    permissions = list(
        user.roles.filter(rolepermission__permission__isnull=False)
        .values_list("rolepermission__permission__name", flat=True)
        .distinct()
        .order_by("rolepermission__permission__name")
    )

    if use_cache:
        cache.set(cache_key, permissions, timeout=PERMISSIONS_CACHE_TTL)

    return permissions


def invalidate_user_permissions_cache(*, user: User) -> None:
    cache.delete(f"user:{user.id}:permissions")
