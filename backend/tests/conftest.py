import pytest
from rest_framework.test import APIClient

from apps.social.models import Friendship, FriendshipStatus
from apps.users.models import User


# Fixtures base — users

@pytest.fixture()
def user(db):
    """Primary user — the one who performs the actions in the tests."""
    return User.objects.create_user(
        email="user@example.com",
        username="test_user",
        full_name="Test User",
        password="pass",
    )


@pytest.fixture()
def other_user(db):
    """Second user — target of the actions (recipient of requests, etc.)."""
    return User.objects.create_user(
        email="other@example.com",
        username="other_user",
        full_name="Other User",
        password="pass",
    )


@pytest.fixture()
def third_user(db):
    """Third-party user — useful for multi-stakeholder testing."""
    return User.objects.create_user(
        email="third@example.com",
        username="third_user",
        full_name="Third User",
        password="pass",
    )


# HTTP client fixtures

@pytest.fixture()
def api_client():
    """Client without authentication — for testing protected endpoints."""
    return APIClient()


@pytest.fixture()
def auth_client(user):
    """Client authenticated as `user`. """
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.fixture()
def other_auth_client(other_user):
    """Client authenticated as `other_user`."""
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client