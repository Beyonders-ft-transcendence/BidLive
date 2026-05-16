import pytest
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
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
def test_swagger_oauth2_token_endpoint_returns_flat_bearer_payload(user):
    client = APIClient()

    response = client.post(
        "/api/auth/swagger-token/",
        {"grant_type": "password", "username": user.email, "password": "pass"},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.data["access_token"]
    assert response.data["refresh_token"]
    assert response.data["token_type"] == "Bearer"
    assert "success" not in response.data


@pytest.mark.django_db
def test_swagger_oauth2_token_endpoint_accepts_username(user):
    client = APIClient()

    response = client.post(
        "/api/auth/swagger-token/",
        {"grant_type": "password", "username": user.username, "password": "pass"},
        format="multipart",
    )

    assert response.status_code == 200
    assert response.data["access_token"]


@pytest.mark.django_db
def test_swagger_oauth2_token_endpoint_rejects_invalid_credentials(user):
    client = APIClient()

    response = client.post(
        "/api/auth/swagger-token/",
        {"grant_type": "password", "username": user.email, "password": "wrong-pass"},
        format="multipart",
    )

    assert response.status_code == 400
    assert response.data["error"] == "invalid_grant"


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
    User.objects.create_user(
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


@pytest.mark.django_db
def test_auth_refresh_rotates_refresh_token(user):
    client = APIClient()
    login_response = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "pass"},
        format="json",
    )

    response = client.post(
        "/api/auth/refresh/",
        {"refresh_token": login_response.data["data"]["refresh_token"]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["success"] is True
    assert response.data["data"]["access_token"]
    assert response.data["data"]["refresh_token"]
    assert response.data["data"]["refresh_token"] != login_response.data["data"]["refresh_token"]


@pytest.mark.django_db
def test_auth_me_requires_authentication(api_client):
    response = api_client.get("/api/auth/me/")

    assert response.status_code == 401


@pytest.mark.django_db
def test_auth_change_password_updates_credentials(user, auth_client):
    response = auth_client.post(
        "/api/auth/change-password/",
        {"current_password": "pass", "new_password": "NewStrongPass123!"},
        format="json",
    )

    user.refresh_from_db()
    assert response.status_code == 200
    assert user.check_password("NewStrongPass123!")


@pytest.mark.django_db
def test_auth_change_password_rejects_wrong_current_password(auth_client):
    response = auth_client.post(
        "/api/auth/change-password/",
        {"current_password": "wrong-pass", "new_password": "NewStrongPass123!"},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["success"] is False


@pytest.mark.django_db
def test_auth_forgot_password_always_returns_success(api_client, user):
    response = api_client.post(
        "/api/auth/forgot-password/",
        {"email": user.email},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["success"] is True


@pytest.mark.django_db
def test_auth_reset_password_with_valid_token_updates_password(api_client, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    response = api_client.post(
        "/api/auth/reset-password/",
        {"uid": uid, "token": token, "new_password": "ResetStrongPass123!"},
        format="json",
    )

    user.refresh_from_db()
    assert response.status_code == 200
    assert user.check_password("ResetStrongPass123!")


@pytest.mark.django_db
def test_auth_reset_password_rejects_invalid_token(api_client, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    response = api_client.post(
        "/api/auth/reset-password/",
        {"uid": uid, "token": "invalid-token", "new_password": "ResetStrongPass123!"},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["success"] is False
