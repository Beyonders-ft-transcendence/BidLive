import pytest

pytestmark = pytest.mark.django_db


def test_schema_route_returns_openapi_document(api_client):
    response = api_client.get("/api/schema/")

    assert response.status_code == 200
    assert response.data["openapi"]
    assert "/api/auth/login/" in response.data["paths"]
    assert "/api/auth/google/" in response.data["paths"]
    assert "/api/auth/google/callback/" in response.data["paths"]
    assert "/api/users/" in response.data["paths"]
    assert "/api/roles/" in response.data["paths"]
    assert "/api/permissions/" in response.data["paths"]
    assert "/api/domain/" in response.data["paths"]


def _request_schema_for(schema, path):
    operation = schema["paths"][path]["post"]
    content = operation["requestBody"]["content"]["application/json"]
    request_schema = content["schema"]
    if "$ref" in request_schema:
        component_name = request_schema["$ref"].split("/")[-1]
        request_schema = schema["components"]["schemas"][component_name]
    return operation, content, request_schema


def test_auth_routes_document_request_bodies_and_examples(api_client):
    response = api_client.get("/api/schema/")
    schema = response.data

    expected_fields = {
        "/api/auth/login/": {"email", "password"},
        "/api/auth/register/": {"email", "username", "full_name", "password"},
        "/api/auth/refresh/": {"refresh_token"},
        "/api/auth/logout/": set(),
        "/api/auth/change-password/": {"current_password", "new_password"},
        "/api/auth/forgot-password/": {"email"},
        "/api/auth/reset-password/": {"uid", "token", "new_password"},
    }

    for path, fields in expected_fields.items():
        operation, content, request_schema = _request_schema_for(schema, path)

        assert operation["tags"] == ["auth"]
        assert "requestBody" in operation
        assert "schema" in content
        assert "examples" in content
        assert fields.issubset(set(request_schema.get("properties", {})))
        assert fields.issubset(set(request_schema.get("required", [])))
        assert operation["responses"]


def test_schema_exposes_jwt_and_swagger_oauth2_security_schemes(api_client):
    response = api_client.get("/api/schema/")
    security_schemes = response.data["components"]["securitySchemes"]

    assert security_schemes["jwtAuth"] == {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    assert security_schemes["SwaggerOAuth2"] == {
        "type": "oauth2",
        "description": (
            "Login JWT pelo Swagger UI. Use email ou username no campo Username. "
            "O Swagger chama /api/auth/swagger-token/ e aplica o Bearer token automaticamente."
        ),
        "flows": {
            "password": {
                "tokenUrl": "/api/auth/swagger-token/",
                "scopes": {},
            }
        },
    }
    assert "basicAuth" not in security_schemes
    assert {"jwtAuth": []} in response.data["paths"]["/api/auth/me/"]["get"]["security"]
    assert {"SwaggerOAuth2": []} in response.data["paths"]["/api/auth/me/"]["get"]["security"]


def test_swagger_ui_route_is_available(client):
    response = client.get("/api/docs/")

    assert response.status_code == 200
    assert b"swagger" in response.content.lower()


def test_redoc_route_is_available(client):
    response = client.get("/api/redoc/")

    assert response.status_code == 200
    assert b"redoc" in response.content.lower()


def test_admin_route_redirects_to_login(client):
    response = client.get("/admin/")

    assert response.status_code == 302
    assert "/admin/login/" in response["Location"]
