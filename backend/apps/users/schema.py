from drf_spectacular.extensions import OpenApiAuthenticationExtension


class JWTAndSwaggerOAuth2Scheme(OpenApiAuthenticationExtension):
    target_class = "rest_framework_simplejwt.authentication.JWTAuthentication"
    priority = 1
    name = ["jwtAuth", "SwaggerOAuth2"]

    def get_security_requirement(self, auto_schema):
        return [{"jwtAuth": []}, {"SwaggerOAuth2": []}]

    def get_security_definition(self, auto_schema):
        return [
            {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            },
            {
                "type": "oauth2",
                "description": (
                    "Login JWT pelo Swagger UI. Use email ou username no campo Username. "
                    "O Swagger chama /api/auth/swagger-token/ e aplica o Bearer token "
                    "automaticamente."
                ),
                "flows": {
                    "password": {
                        "tokenUrl": "/api/auth/swagger-token/",
                        "scopes": {},
                    }
                },
            },
        ]

