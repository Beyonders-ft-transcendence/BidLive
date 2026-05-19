from functools import wraps

from rest_framework.exceptions import PermissionDenied

from apps.users.authorization_service import user_has_permission


def require_permission(permission_name: str):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            if not request.user or request.user.is_anonymous:
                raise PermissionDenied({"permission": ["Autenticacao necessaria."]})
            if not user_has_permission(user=request.user, permission_name=permission_name):
                raise PermissionDenied(
                    {"permission": [f"Permissao {permission_name} necessaria."]}
                )
            return view_func(self, request, *args, **kwargs)

        return wrapper

    return decorator
