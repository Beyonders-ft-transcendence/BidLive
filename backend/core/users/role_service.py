from typing import Any

from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from core.users.authorization_service import (
    invalidate_user_role_cache,
    log_permission_audit,
    user_has_permission,
)
from core.users.models import Permission, Role, RolePermission, User, UserRole


@transaction.atomic
def create_role(
    *,
    actor: User,
    name: str,
    description: str = "",
    permission_names: list[str] | None = None,
    ip_address: str = "",
) -> Role:
    if not user_has_permission(user=actor, permission_name="role.manage"):
        raise PermissionDenied({"permission": ["Permissao role.manage necessaria."]})
    if Role.objects.filter(name=name).exists():
        raise ValidationError({"name": ["Role ja existe."]})

    role = Role.objects.create(name=name, description=description)
    if permission_names:
        set_role_permissions(actor=actor, role=role, permission_names=permission_names, ip_address=ip_address)

    log_permission_audit(
        actor=actor,
        action="role.created",
        resource_type="role",
        resource_id=role.id,
        metadata={"name": name},
        ip_address=ip_address,
    )
    return role


@transaction.atomic
def update_role(
    *,
    actor: User,
    role: Role,
    data: dict[str, Any],
    ip_address: str = "",
) -> Role:
    if not user_has_permission(user=actor, permission_name="role.manage"):
        raise PermissionDenied({"permission": ["Permissao role.manage necessaria."]})

    if "name" in data:
        role.name = data["name"]
    if "description" in data:
        role.description = data["description"]
    role.save()

    permission_names = data.get("permission_names")
    if permission_names is not None:
        set_role_permissions(actor=actor, role=role, permission_names=permission_names, ip_address=ip_address)

    _invalidate_users_for_role(role=role)
    log_permission_audit(
        actor=actor,
        action="role.updated",
        resource_type="role",
        resource_id=role.id,
        metadata=data,
        ip_address=ip_address,
    )
    return role


@transaction.atomic
def delete_role(*, actor: User, role: Role, ip_address: str = "") -> None:
    if not user_has_permission(user=actor, permission_name="role.manage"):
        raise PermissionDenied({"permission": ["Permissao role.manage necessaria."]})
    if UserRole.objects.filter(role=role).exists():
        raise ValidationError({"role": ["Role possui usuarios associados."]})

    role_id = role.id
    role_name = role.name
    role.delete()
    log_permission_audit(
        actor=actor,
        action="role.deleted",
        resource_type="role",
        resource_id=role_id,
        metadata={"name": role_name},
        ip_address=ip_address,
    )


@transaction.atomic
def set_role_permissions(
    *,
    actor: User,
    role: Role,
    permission_names: list[str],
    ip_address: str = "",
) -> Role:
    if not user_has_permission(user=actor, permission_name="role.manage"):
        raise PermissionDenied({"permission": ["Permissao role.manage necessaria."]})

    permissions = list(Permission.objects.filter(name__in=permission_names))
    if len(permissions) != len(set(permission_names)):
        found = {permission.name for permission in permissions}
        missing = sorted(set(permission_names) - found)
        raise ValidationError({"permission_names": [f"Permissions invalidas: {', '.join(missing)}"]})

    RolePermission.objects.filter(role=role).exclude(permission__in=permissions).delete()
    for permission in permissions:
        RolePermission.objects.get_or_create(role=role, permission=permission)

    _invalidate_users_for_role(role=role)
    log_permission_audit(
        actor=actor,
        action="role.permissions_updated",
        resource_type="role",
        resource_id=role.id,
        metadata={"permission_names": permission_names},
        ip_address=ip_address,
    )
    return role


def serialize_role(*, role: Role, include_users: bool = False) -> dict[str, Any]:
    permission_names = list(
        role.rolepermission_set.select_related("permission").values_list("permission__name", flat=True)
    )
    payload = {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "permissions": permission_names,
        "created_at": role.created_at,
        "updated_at": role.updated_at,
    }
    if include_users:
        payload["users"] = list(role.users.values_list("id", flat=True))
    return payload


def _invalidate_users_for_role(*, role: Role) -> None:
    for user in role.users.all():
        invalidate_user_role_cache(user=user)
