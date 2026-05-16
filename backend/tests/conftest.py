import pytest
from rest_framework.test import APIClient

from core.users.models import User


@pytest.fixture()
def user(db):
    return User.objects.create_user(
        email="user@example.com",
        username="test_user",
        full_name="Test User",
        password="pass",
    )


@pytest.fixture()
def api_client():
    return APIClient()


@pytest.fixture()
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
