import pytest

from core.users.models import User


@pytest.fixture()
def user(db):
    return User.objects.create_user(
        email="user@example.com",
        username="test_user",
        full_name="Test User",
        password="pass",
    )
