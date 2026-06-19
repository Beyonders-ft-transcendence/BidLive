from rest_framework.permissions import BasePermission

from apps.users.constants import ROLE_MONITOR, ROLE_SUPER_ADMIN


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.has_role(ROLE_SUPER_ADMIN) or user.has_role(ROLE_MONITOR))
        )
