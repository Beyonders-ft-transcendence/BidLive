from typing import Any

from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from core.users.authorization_service import log_permission_audit, user_has_permission
from core.users.models import Permission, RolePermission, User


@transaction.atomic
def create_permission(
    *,
    actor: User,
    name: str,
    description: str = "",
    ip_address: str = "",
) -> Permission:
    if not user_has_permission(user=actor, permission_name="permission.manage"):
        raise PermissionDenied({"permission": ["Permissao permission.manage necessaria."]})
    if Permission.objects.filter(name=name).exists():
        raise ValidationError({"name": ["Permission ja existe."]})

    permission = Permission.objects.create(name=name, description=description)
    log_permission_audit(
        actor=actor,
        action="permission.created",
        resource_type="permission",
        resource_id=permission.id,
        metadata={"name": name},
        ip_address=ip_address,
    )
    return permission


@transaction.atomic
def update_permission(
    *,
    actor: User,
    permission: Permission,
    data: dict[str, Any],
    ip_address: str = "",
) -> Permission:
    if not user_has_permission(user=actor, permission_name="permission.manage"):
        raise PermissionDenied({"permission": ["Permissao permission.manage necessaria."]})

    if "name" in data:
        permission.name = data["name"]
    if "description" in data:
        permission.description = data["description"]
    permission.save()

    log_permission_audit(
        actor=actor,
        action="permission.updated",
        resource_type="permission",
        resource_id=permission.id,
        metadata=data,
        ip_address=ip_address,
    )
    return permission


@transaction.atomic
def delete_permission(*, actor: User, permission: Permission, ip_address: str = "") -> None:
    if not user_has_permission(user=actor, permission_name="permission.manage"):
        raise PermissionDenied({"permission": ["Permissao permission.manage necessaria."]})
    if RolePermission.objects.filter(permission=permission).exists():
        raise ValidationError({"permission": ["Permission vinculada a roles."]})

    permission_id = permission.id
    permission_name = permission.name
    permission.delete()
    log_permission_audit(
        actor=actor,
        action="permission.deleted",
        resource_type="permission",
        resource_id=permission_id,
        metadata={"name": permission_name},
        ip_address=ip_address,
    )


def serialize_permission(*, permission: Permission) -> dict[str, Any]:
    role_names = list(
        permission.rolepermission_set.select_related("role").values_list("role__name", flat=True)
    )
    return {
        "id": permission.id,
        "name": permission.name,
        "description": permission.description,
        "roles": role_names,
        "created_at": permission.created_at,
        "updated_at": permission.updated_at,
    }
