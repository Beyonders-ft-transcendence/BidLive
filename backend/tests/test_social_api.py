import pytest

from apps.social.models import Friendship, FriendshipStatus


# AUTHENTICATION — all endpoints require login

@pytest.mark.django_db
class TestAuthenticationRequired:
    def test_list_friends_requires_auth(self, client):
        response = client.get("/api/social/friendships/")
        assert response.status_code == 401

    def test_send_request_requires_auth(self, api_client, other_user):
        res = api_client.post("/api/social/friendships/", {"addressee_id": other_user.id}, format="json")
        assert res.status_code == 401

    def test_accept_requires_auth(self, api_client, friendship_pending):
        res = api_client.post(f"/api/social/friendships/{friendship_pending.id}/accept/")
        assert res.status_code == 401

    def test_reject_requires_auth(self, api_client, friendship_pending):
        res = api_client.post(f"/api/social/friendships/{friendship_pending.id}/reject/")
        assert res.status_code == 401

    def test_remove_requires_auth(self, api_client, friendship_accepted):
        res = api_client.delete(f"/api/social/friendships/{friendship_accepted.id}/")
        assert res.status_code == 401

    def test_block_requires_auth(self, api_client, other_user):
        res = api_client.post("/api/social/users/block/", {"user_id": other_user.id}, format="json")
        assert res.status_code == 401

    def test_online_friends_requires_auth(self, api_client):
        res = api_client.get("/api/social/friendships/online/")
        assert res.status_code == 401
