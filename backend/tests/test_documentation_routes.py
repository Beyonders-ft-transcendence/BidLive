import pytest

pytestmark = pytest.mark.django_db


def test_schema_route_returns_openapi_document(api_client):
    response = api_client.get("/api/schema/")

    assert response.status_code == 200
    assert response.data["openapi"]
    assert "/api/auth/login/" in response.data["paths"]
    assert "/api/domain/" in response.data["paths"]


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
