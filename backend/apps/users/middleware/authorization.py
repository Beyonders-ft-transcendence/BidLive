from apps.users.authorization_service import log_access_denied


class AuthorizationAuditMiddleware:
    """Log denied API access attempts after the view returns 403."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code == 403 and request.path.startswith("/api/"):
            required = getattr(request, "required_permissions", None)
            if required:
                for permission_name in required:
                    log_access_denied(
                        request=request,
                        permission_name=permission_name,
                        view_name=getattr(request.resolver_match, "view_name", ""),
                    )
        return response
