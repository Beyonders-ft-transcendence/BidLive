import pytest

from apps.social.models import Friendship, FriendshipStatus


# AUTHENTICATION — all endpoints require login

@pytest.mark.django_db
class TestAuthenticationRequired:
    def test_list_friends_requires_auth(self, client):
        response = client.get("/api/social/friendships/")
        assert response.status_code == 401