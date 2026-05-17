from rest_framework.permissions import BasePermission, IsAuthenticated

from core.users.authorization_service import (
    log_access_denied,
    user_has_all_permissions,
    user_has_any_permission,
)
from core.users.selectors import get_user_permissions


class HasRBACPermission(BasePermission):
    """Require all permissions listed on view.required_permissions."""

    def has_permission(self, request, view):
        required_permissions = getattr(view, "required_permissions", [])
        if not required_permissions:
            return True
        if not request.user or request.user.is_anonymous:
            return False
        granted = user_has_all_permissions(user=request.user, permission_names=required_permissions)
        if not granted:
            for permission_name in required_permissions:
                if permission_name not in get_user_permissions(user=request.user):
                    log_access_denied(
                        request=request,
                        permission_name=permission_name,
                        view_name=view.__class__.__name__,
                    )
                    break
        return granted


class HasAnyRBACPermission(BasePermission):
    """Require at least one permission from view.required_any_permissions."""

    def has_permission(self, request, view):
        required_permissions = getattr(view, "required_any_permissions", [])
        if not required_permissions:
            return True
        if not request.user or request.user.is_anonymous:
            return False
        return user_has_any_permission(user=request.user, permission_names=required_permissions)


class RBACPermissionMixin:
    permission_classes = [IsAuthenticated, HasRBACPermission]
