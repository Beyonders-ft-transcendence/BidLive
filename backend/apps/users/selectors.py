from django.core.cache import cache
from django.db.models import Prefetch, QuerySet

from apps.users.models import Permission, Role, User, UserStatus

PERMISSIONS_CACHE_TTL = 300



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



def get_user_by_id(*, user_id: int) -> User:
    return User.objects.prefetch_related("roles").get(pk=user_id)


def list_roles() -> QuerySet[Role]:
    return Role.objects.prefetch_related("rolepermission_set__permission").order_by("name")


def get_role_by_id(*, role_id: int) -> Role:
    return Role.objects.prefetch_related("rolepermission_set__permission").get(pk=role_id)


def list_permissions() -> QuerySet[Permission]:
    return Permission.objects.prefetch_related("rolepermission_set__role").order_by("name")


def get_permission_by_id(*, permission_id: int) -> Permission:
    return Permission.objects.prefetch_related("rolepermission_set__role").get(pk=permission_id)
