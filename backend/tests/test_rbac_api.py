import pytest
from rest_framework.test import APIClient

from core.users.constants import ROLE_PERSONAL_USER, ROLE_SUPER_ADMIN
from core.users.models import Permission, Role, RolePermission, User, UserRole


@pytest.fixture()
def super_admin(db):
    user = User.objects.create_user(
        email="admin@example.com",
        username="super_admin",
        full_name="Super Admin",
        password="AdminPass123!",
        is_staff=True,
    )
    role, _ = Role.objects.get_or_create(name=ROLE_SUPER_ADMIN)
    for permission in Permission.objects.all():
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    return user


@pytest.fixture()
def super_admin_client(super_admin):
    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": super_admin.email, "password": "AdminPass123!"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['access_token']}")
    return client


@pytest.mark.django_db
def test_super_admin_lists_users(super_admin_client):
    response = super_admin_client.get("/api/users/")
    assert response.status_code == 200
    assert response.data["success"] is True


@pytest.mark.django_db
def test_personal_user_cannot_list_users(user):
    role, _ = Role.objects.get_or_create(name=ROLE_PERSONAL_USER)
    UserRole.objects.get_or_create(user=user, role=role)

    client = APIClient()
    login = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": "pass"},
        format="json",
    )
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['access_token']}")

    response = client.get("/api/users/")
    assert response.status_code == 200
    assert len(response.data["data"]["results"] if "results" in response.data["data"] else response.data["data"]) == 1


@pytest.mark.django_db
def test_super_admin_creates_role(super_admin_client):
    response = super_admin_client.post(
        "/api/roles/",
        {
            "name": "MODERATOR",
            "description": "Moderator role",
            "permission_names": ["report.review", "auction.read"],
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["data"]["name"] == "MODERATOR"
    assert "report.review" in response.data["data"]["permissions"]


@pytest.mark.django_db
def test_super_admin_manages_permissions(super_admin_client):
    response = super_admin_client.post(
        "/api/permissions/",
        {"name": "stream.manage", "description": "Manage live streams"},
        format="json",
    )
    assert response.status_code == 201
    assert response.data["data"]["name"] == "stream.manage"


@pytest.mark.django_db
def test_jwt_contains_roles_and_permissions(super_admin_client, super_admin):
    response = super_admin_client.get("/api/auth/me/")
    assert response.status_code == 200

    login = APIClient().post(
        "/api/auth/login/",
        {"email": super_admin.email, "password": "AdminPass123!"},
        format="json",
    )
    assert ROLE_SUPER_ADMIN in login.data["data"]["user"]["roles"]
    assert "role.manage" in login.data["data"]["user"]["permissions"]
