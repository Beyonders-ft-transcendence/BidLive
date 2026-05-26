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


# ACCEPT FRIEND REQUEST

@pytest.mark.django_db
class TestAcceptFriendRequest:

    def test_accept_success(self, other_auth_client, friendship_pending):
        """other_user accepts the request sent by user."""
        res = other_auth_client.post(
            f"/api/social/friendships/{friendship_pending.id}/accept/"
        )
        assert res.status_code == 200
        assert res.data["data"]["status"] == FriendshipStatus.ACCEPTED

    def test_accept_updates_db_status(self, other_auth_client, friendship_pending):
        """Confirms that the status has been updated in the database."""
        other_auth_client.post(f"/api/social/friendships/{friendship_pending.id}/accept/")
        friendship_pending.refresh_from_db()
        assert friendship_pending.status == FriendshipStatus.ACCEPTED

    def test_requester_cannot_accept_own_request(self, auth_client, friendship_pending):
        """
        The sender of the request cannot accept it — only the recipient can.
        auth_client is the requester → 400.
        """
        res = auth_client.post(
            f"/api/social/friendships/{friendship_pending.id}/accept/"
        )
        assert res.status_code == 400

    def test_accept_already_accepted(self, other_auth_client, friendship_accepted):
        """Request already accepted → 400."""
        res = other_auth_client.post(
            f"/api/social/friendships/{friendship_accepted.id}/accept/"
        )
        assert res.status_code == 400

    def test_accept_nonexistent_friendship(self, auth_client):
        """ID that does not exist → 400."""
        res = auth_client.post("/api/social/friendships/99999/accept/")
        assert res.status_code == 400


# REJECT FRIEND REQUEST

@pytest.mark.django_db
class TestRejectFriendRequest:

    def test_reject_success(self, other_auth_client, friendship_pending):
        """Recipient rejects request → record deleted from database."""
        res = other_auth_client.post(
            f"/api/social/friendships/{friendship_pending.id}/reject/"
        )
        assert res.status_code == 200
        assert res.data["success"] is True

    def test_reject_deletes_db_record(self, other_auth_client, friendship_pending):
        """Confirms that the record has been deleted from the database."""
        pk = friendship_pending.id
        other_auth_client.post(f"/api/social/friendships/{pk}/reject/")
        assert not Friendship.objects.filter(id=pk).exists()

    def test_requester_cannot_reject_own_request(self, auth_client, friendship_pending):
        """The sender of the request cannot reject it — only the recipient can."""
        res = auth_client.post(
            f"/api/social/friendships/{friendship_pending.id}/reject/"
        )
        assert res.status_code == 400

    def test_reject_already_accepted_friendship(self, other_auth_client, friendship_accepted):
        """The recipient cannot reject a friendship that has already been accepted."""
        res = other_auth_client.post(
            f"/api/social/friendships/{friendship_accepted.id}/reject/"
        )
        assert res.status_code == 400


# REMOVE FRIEND

@pytest.mark.django_db
class TestRemoveFriend:

    def test_remove_friendship_by_requester(self, auth_client, friendship_accepted):
        """The sender of the original request can remove the friendship."""
        res = auth_client.delete(f"/api/social/friendships/{friendship_accepted.id}/")
        assert res.status_code == 200
        assert res.data["success"] is True

    def test_remove_friendship_by_addressee(self, other_auth_client, friendship_accepted):
        """The recipient can also remove the friendship."""
        res = other_auth_client.delete(f"/api/social/friendships/{friendship_accepted.id}/")
        assert res.status_code == 200

    def test_remove_deletes_db_record(self, auth_client, friendship_accepted):
        """Confirms that the record has been deleted from the database."""
        pk = friendship_accepted.id
        auth_client.delete(f"/api/social/friendships/{pk}/")
        assert not Friendship.objects.filter(id=pk).exists()

    def test_remove_pending_friendship_fails(self, auth_client, friendship_pending):
        """The sender cannot remove a pending friendship."""
        res = auth_client.delete(f"/api/social/friendships/{friendship_pending.id}/")
        assert res.status_code == 400

    def test_remove_nonexistent_friendship(self, auth_client):
        """ID nonexistent → 400."""
        res = auth_client.delete("/api/social/friendships/99999/")
        assert res.status_code == 400


# LIST FRIENDS 

@pytest.mark.django_db
class TestListFriends:

    def test_list_friends_returns_accepted_only(self, auth_client, friendship_accepted, other_user):
        """Only ACCEPTED friendships appear in the list."""
        res = auth_client.get("/api/social/friendships/")
        assert res.status_code == 200
        ids = [f["id"] for f in res.data["data"]]
        assert other_user.id in ids

    def test_list_friends_excludes_pending(self, auth_client, friendship_pending):
        """Only ACCEPTED friendships appear in the list."""
        res = auth_client.get("/api/social/friendships/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 0

    def test_list_friends_empty_when_no_friends(self, auth_client):
        """Only ACCEPTED friendships appear in the list."""
        res = auth_client.get("/api/social/friendships/")
        assert res.status_code == 200
        assert res.data["data"] == []

    def test_list_online_friends(self, auth_client, other_user, friendship_accepted):
        """Only friends with is_online=True appear in the list."""
        other_user.is_online = True
        other_user.save(update_fields=["is_online"])

        res = auth_client.get("/api/social/friendships/online/")
        assert res.status_code == 200
        ids = [f["id"] for f in res.data["data"]]
        assert other_user.id in ids

    def test_list_online_friends_excludes_offline(self, auth_client, other_user, friendship_accepted):
        """Only friends with is_online=True appear in the list."""
        other_user.is_online = False
        other_user.save(update_fields=["is_online"])

        res = auth_client.get("/api/social/friendships/online/")
        assert res.status_code == 200
        assert res.data["data"] == []


# LIST RECEIVED AND SENT FRIEND REQUESTS

@pytest.mark.django_db
class TestListRequests:

    def test_list_received_requests(self, other_auth_client, friendship_pending, user):
        """other_user received a request from user → appears in /requests/received/."""
        res = other_auth_client.get("/api/social/friendships/requests/received/")
        assert res.status_code == 200
        requester_ids = [f["requester"]["id"] for f in res.data["data"]]
        assert user.id in requester_ids

    def test_list_sent_requests(self, auth_client, friendship_pending, other_user):
        """user sent a request to other_user → appears in /requests/sent/."""
        res = auth_client.get("/api/social/friendships/requests/sent/")
        assert res.status_code == 200
        addressee_ids = [f["addressee"]["id"] for f in res.data["data"]]
        assert other_user.id in addressee_ids

    def test_received_excludes_accepted(self, other_auth_client, friendship_accepted):
        """Accepted friendships do not appear in received requests."""
        res = other_auth_client.get("/api/social/friendships/requests/received/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 0

    def test_sent_excludes_accepted(self, auth_client, friendship_accepted):
        """Accepted friendships do not appear in sent requests."""
        res = auth_client.get("/api/social/friendships/requests/sent/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 0


# BLOCK / UNBLOCK SYSTEM

@pytest.mark.django_db
class TestBlockUser:

    def test_block_success(self, auth_client, other_user):
        """Block a user → BLOCKED record created."""
        res = auth_client.post(
            "/api/social/users/block/",
            {"user_id": other_user.id},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True

    def test_block_creates_blocked_record(self, auth_client, user, other_user):
        """Confirm the BLOCKED record is created in the DB."""
        auth_client.post(
            "/api/social/users/block/",
            {"user_id": other_user.id},
            format="json",
        )
        assert Friendship.objects.filter(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.BLOCKED,
        ).exists()

    def test_block_converts_existing_friendship(self, auth_client, user, other_user, friendship_accepted):
        """
        If they were already friends, blocking converts the existing record
        instead of creating a duplicate.
        """
        auth_client.post(
            "/api/social/users/block/",
            {"user_id": other_user.id},
            format="json",
        )
        # Deve existir só 1 registo (o convertido), não 2
        assert Friendship.objects.filter(
            requester=user, addressee=other_user
        ).count() == 1
        assert Friendship.objects.get(
            requester=user, addressee=other_user
        ).status == FriendshipStatus.BLOCKED

    def test_block_already_blocked_user(self, auth_client, other_user, friendship_blocked):
        """Block someone who is already blocked → 400."""
        res = auth_client.post(
            "/api/social/users/block/",
            {"user_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_block_self(self, auth_client, user):
        """Cannot block yourself → 400."""
        res = auth_client.post(
            "/api/social/users/block/",
            {"user_id": user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_block_missing_user_id(self, auth_client):
        """Missing user_id field → 400."""
        res = auth_client.post("/api/social/users/block/", {}, format="json")
        assert res.status_code == 400

    def test_unblock_success(self, auth_client, other_user, friendship_blocked):
        """Unblock a user → BLOCKED record deleted."""
        res = auth_client.post(
            "/api/social/users/unblock/",
            {"user_id": other_user.id},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["success"] is True

    def test_unblock_deletes_record(self, auth_client, user, other_user, friendship_blocked):
        """Confirm the BLOCKED record is deleted from the DB."""
        auth_client.post(
            "/api/social/users/unblock/",
            {"user_id": other_user.id},
            format="json",
        )
        assert not Friendship.objects.filter(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.BLOCKED,
        ).exists()

    def test_unblock_when_not_blocked(self, auth_client, other_user):
        """Unblock someone who is not blocked → 400."""
        res = auth_client.post(
            "/api/social/users/unblock/",
            {"user_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400

    def test_blocked_user_cannot_send_request(self, auth_client, other_user, friendship_blocked):
        """After blocking, the blocker cannot send a request to the blocked user → 400."""
        res = auth_client.post(
            "/api/social/friendships/",
            {"addressee_id": other_user.id},
            format="json",
        )
        assert res.status_code == 400
