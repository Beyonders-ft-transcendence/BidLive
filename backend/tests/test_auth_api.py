import pytest
from rest_framework.test import APIClient

from core.users.models import Permission, Role, RolePermission, User, UserRole


@pytest.mark.django_db
def test_auth_register_and_login_flow():
    client = APIClient()

    register_response = client.post(
        "/api/auth/register/",
        {
            "email": "new.user@example.com",
            "username": "new_user",
            "full_name": "New User",
            "password": "StrongPass123!",
        },
        format="json",
    )
    assert register_response.status_code == 201
    assert register_response.data["success"] is True

    login_response = client.post(
        "/api/auth/login/",
        {"email": "new.user@example.com", "password": "StrongPass123!"},
        format="json",
    )
    assert login_response.status_code == 200
    assert login_response.data["data"]["access_token"]
    assert login_response.data["data"]["refresh_token"]


@pytest.mark.django_db
def test_auth_me_includes_roles_permissions():
    user = User.objects.create_user(
        email="member@example.com",
        username="member",
        full_name="Member User",
        password="StrongPass123!",
    )
    role, _ = Role.objects.get_or_create(name="USER")
    permission, _ = Permission.objects.get_or_create(name="auction.bid")
    RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)

    client = APIClient()
    login_response = client.post(
        "/api/auth/login/",
        {"email": "member@example.com", "password": "StrongPass123!"},
        format="json",
    )
    access_token = login_response.data["data"]["access_token"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    response = client.get("/api/auth/me/")
    assert response.status_code == 200
    assert response.data["data"]["roles"]


@pytest.mark.django_db
def test_auth_logout_revokes_refresh_token():
    user = User.objects.create_user(
        email="logout@example.com",
        username="logout_user",
        full_name="Logout User",
        password="StrongPass123!",
    )
    client = APIClient()
    login_response = client.post(
        "/api/auth/login/",
        {"email": "logout@example.com", "password": "StrongPass123!"},
        format="json",
    )
    access_token = login_response.data["data"]["access_token"]
    refresh_token = login_response.data["data"]["refresh_token"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    logout_response = client.post(
        "/api/auth/logout/",
        {"refresh_token": refresh_token},
        format="json",
    )
    assert logout_response.status_code == 200

    refresh_response = client.post(
        "/api/auth/refresh/",
        {"refresh_token": refresh_token},
        format="json",
    )
    assert refresh_response.status_code >= 400
