from rest_framework.permissions import BasePermission

from core.users.selectors import get_user_permissions


class HasRBACPermission(BasePermission):
    def has_permission(self, request, view):
        required_permissions = getattr(view, "required_permissions", [])
        if not required_permissions:
            return True
        if not request.user or request.user.is_anonymous:
            return False
        granted = set(get_user_permissions(user=request.user))
        return all(permission in granted for permission in required_permissions)
