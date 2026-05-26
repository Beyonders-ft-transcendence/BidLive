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


# SEND FRIEND REQUEST

@pytest.mark.django_db
class TestSendFriendRequest:

    def test_send_request_success(self, auth_client, other_user):
        """Happy Path — Order sent successfully."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["success"] is True
        assert res.data["data"]["status"] == FriendshipStatus.PENDING

    def test_send_request_creates_db_record(self, auth_client, user, other_user):
        """Confirms that the record was created in the database."""
        auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert Friendship.objects.filter(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.PENDING,
        ).exists()

    def test_send_request_to_nonexistent_user(self, auth_client):
        """Target user does not exist → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": 99999},
            format="json",
        )
        assert res.status_code == 400
        assert res.data["success"] is False

    def test_send_request_to_self(self, auth_client, user):
        """Cannot add yourself → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_send_request_when_already_friends(self, auth_client, other_user, friendship_accepted):
        """Target user is already your friend → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_send_request_when_pending_exists(self, auth_client, other_user, friendship_pending):
        """Target user has a pending request → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_send_request_when_blocked(self, auth_client, other_user, friendship_blocked):
        """Target user has blocked you → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_send_request_missing_addressee_id(self, auth_client):
        """Required field missing → 400."""
        res = auth_client.post("/api/social/friendships/", {}, format="json")
        assert res.status_code == 400
