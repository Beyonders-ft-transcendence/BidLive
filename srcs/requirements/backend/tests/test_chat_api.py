import pytest
 
from apps.chat.models import Message, PrivateConversation, PrivateMessage
 

# AUTHENTICATION — all endpoints require login.

@pytest.mark.django_db
class TestAuthenticationRequired:
 
    def test_list_conversations_requires_auth(self, api_client):
        res = api_client.get("/api/chat/conversations/")
        assert res.status_code == 401
 
    def test_send_private_message_requires_auth(self, api_client, other_user):
        res = api_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "Olá",
        }, format="json")
        assert res.status_code == 401
 
    def test_conversation_messages_requires_auth(self, api_client, private_conversation):
        res = api_client.get(f"/api/chat/conversations/{private_conversation.id}/messages/")
        assert res.status_code == 401
 
    def test_mark_read_requires_auth(self, api_client, private_conversation):
        res = api_client.post(f"/api/chat/conversations/{private_conversation.id}/read/")
        assert res.status_code == 401
 
    def test_auction_room_requires_auth(self, api_client, auction):
        res = api_client.get(f"/api/chat/auctions/{auction.id}/room/")
        assert res.status_code == 401
 
    def test_auction_messages_requires_auth(self, api_client, auction):
        res = api_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert res.status_code == 401
 
    def test_send_room_message_requires_auth(self, api_client, auction):
        res = api_client.post(f"/api/chat/auctions/{auction.id}/send/", {
            "message": "Olá sala"
        }, format="json")
        assert res.status_code == 401
 

# LIST PRIVATE CONVERSATIONS
 
@pytest.mark.django_db
class TestListConversations:
 
    def test_list_conversations_empty(self, auth_client):
        """No conversations → empty list."""
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        assert res.data["success"] is True
        assert res.data["data"] == []
 
    def test_list_conversations_shows_own(self, auth_client, private_conversation):
        """User's conversation appears in the list."""
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        ids = [c["id"] for c in res.data["data"]]
        assert private_conversation.id in ids
 
    def test_list_conversations_includes_participants(self, auth_client, private_conversation, user, other_user):
        "The response includes data from both participants."
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        conv = res.data["data"][0]
        participant_ids = {conv["user_one"]["id"], conv["user_two"]["id"]}
        assert user.id in participant_ids
        assert other_user.id in participant_ids
 
    def test_list_conversations_includes_unread_count(self, auth_client, private_conversation, private_message):
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        conv = res.data["data"][0]
        assert "unread_count" in conv
 
    def test_list_conversations_unread_count_for_recipient(
        self, other_auth_client, private_conversation, private_message
    ):
        res = other_auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        conv = res.data["data"][0]
        assert conv["unread_count"] == 1
 
    def test_list_conversations_has_last_message(
        self, auth_client, private_conversation, private_message
    ):
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        conv = res.data["data"][0]
        assert conv["last_message"] is not None
        assert "message" in conv["last_message"]
 
    def test_list_conversations_last_message_none_when_empty(
        self, auth_client, private_conversation
    ):
        """Conversation without messages → last_message is None."""
        res = auth_client.get("/api/chat/conversations/")
        assert res.status_code == 200
        conv = res.data["data"][0]
        assert conv["last_message"] is None
 

# PRIVATE MESSAGE HISTORY
 
@pytest.mark.django_db
class TestPrivateConversationMessages:
 
    def test_list_messages_success(self, auth_client, private_conversation, private_message):
        """Message history successfully returned."""
        res = auth_client.get(f"/api/chat/conversations/{private_conversation.id}/messages/")
        assert res.status_code == 200
        assert res.data["success"] is True
        assert len(res.data["data"]) == 1
 
    def test_list_messages_contains_correct_content(
        self, auth_client, private_conversation, private_message
    ):
        """Message contains the expected fields."""
        res = auth_client.get(f"/api/chat/conversations/{private_conversation.id}/messages/")
        msg = res.data["data"][0]
        assert msg["id"] == private_message.id
        assert msg["message"] == private_message.message
        assert "sender" in msg
        assert msg["sender"]["id"] is not None
 
    def test_list_messages_empty_conversation(self, auth_client, private_conversation):
        """Conversation without messages → empty list."""
        res = auth_client.get(f"/api/chat/conversations/{private_conversation.id}/messages/")
        assert res.status_code == 200
        assert res.data["data"] == []
 
    def test_list_messages_conversation_not_found(self, auth_client):
        """Conversation does not exist → 404."""
        res = auth_client.get("/api/chat/conversations/99999/messages/")
        assert res.status_code == 404
 
    def test_list_messages_not_participant(
        self, other_auth_client, private_conversation, private_message, user
    ):
        from apps.users.models import User
        stranger = User.objects.create_user(
            email="stranger@example.com",
            username="stranger",
            full_name="Stranger",
            password="pass",
        )
        from rest_framework.test import APIClient
        stranger_client = APIClient()
        stranger_client.force_authenticate(user=stranger)
 
        res = stranger_client.get(f"/api/chat/conversations/{private_conversation.id}/messages/")
        assert res.status_code == 404
 

# SEND PRIVATE MESSAGE (REST)
 
@pytest.mark.django_db
class TestSendPrivateMessage:
 
    def test_send_message_success(self, auth_client, other_user):
        res = auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "Olá, como estás?",
        }, format="json")
        assert res.status_code == 201
        assert res.data["success"] is True
        assert res.data["data"]["message"] == "Olá, como estás?"
 
    def test_send_message_creates_conversation(self, auth_client, user, other_user):
        assert not PrivateConversation.objects.filter(
            user_one_id=min(user.id, other_user.id),
            user_two_id=max(user.id, other_user.id),
        ).exists()
 
        auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "Primeira mensagem",
        }, format="json")
 
        assert PrivateConversation.objects.filter(
            user_one_id=min(user.id, other_user.id),
            user_two_id=max(user.id, other_user.id),
        ).exists()
 
    def test_send_message_creates_db_record(self, auth_client, user, other_user):
        """Message created in the database."""
        auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "Mensagem gravada",
        }, format="json")
 
        assert PrivateMessage.objects.filter(
            sender=user,
            message="Mensagem gravada",
        ).exists()
 
    def test_send_message_to_self_fails(self, auth_client, user):
        res = auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": user.id,
            "message": "Mensagem para mim",
        }, format="json")
        assert res.status_code == 400
 
    def test_send_empty_message_fails(self, auth_client, other_user):
        res = auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "   ",
        }, format="json")
        assert res.status_code == 400
 
    def test_send_message_nonexistent_recipient(self, auth_client):
        res = auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": 99999,
            "message": "Olá",
        }, format="json")
        assert res.status_code == 400
 
    def test_send_message_missing_fields(self, auth_client):
        res = auth_client.post("/api/chat/conversations/send/", {}, format="json")
        assert res.status_code == 400
 
    def test_send_message_creates_notification(self, auth_client, other_user):
        from apps.notifications.models import Notification, NotificationType
        auth_client.post("/api/chat/conversations/send/", {
            "recipient_id": other_user.id,
            "message": "Notificação teste",
        }, format="json")
 
        assert Notification.objects.filter(
            user=other_user,
            type=NotificationType.MESSAGE,
        ).exists()
 

# MARK MESSAGES AS READ
 
@pytest.mark.django_db
class TestMarkMessagesAsRead:
 
    def test_mark_as_read_success(
        self, other_auth_client, private_conversation, private_message
    ):
        res = other_auth_client.post(
            f"/api/chat/conversations/{private_conversation.id}/read/"
        )
        assert res.status_code == 200
        assert res.data["success"] is True
 
    def test_mark_as_read_updates_db(
        self, other_auth_client, private_conversation, private_message
    ):
        other_auth_client.post(f"/api/chat/conversations/{private_conversation.id}/read/")
        private_message.refresh_from_db()
        assert private_message.is_read is True
 
    def test_mark_as_read_does_not_mark_own_messages(
        self, auth_client, private_conversation, private_message
    ):
        res = auth_client.post(f"/api/chat/conversations/{private_conversation.id}/read/")
        assert res.status_code == 200
        private_message.refresh_from_db()
        assert private_message.is_read is False
 
    def test_mark_already_read_messages(
        self, other_auth_client, private_conversation, read_private_message
    ):
        res = other_auth_client.post(
            f"/api/chat/conversations/{private_conversation.id}/read/"
        )
        assert res.status_code == 200
 
    def test_mark_read_conversation_not_found(self, auth_client):
        res = auth_client.post("/api/chat/conversations/99999/read/")
        assert res.status_code == 400
 

# DELETE PRIVATE MESSAGE
 
@pytest.mark.django_db
class TestDeletePrivateMessage:
 
    def test_delete_own_message_success(
        self, auth_client, private_message
    ):
        res = auth_client.delete(
            f"/api/chat/conversations/messages/{private_message.id}/"
        )
        assert res.status_code == 200
        assert res.data["success"] is True
 
    def test_delete_removes_db_record(self, auth_client, private_message):
        pk = private_message.id
        auth_client.delete(f"/api/chat/conversations/messages/{pk}/")
        assert not PrivateMessage.objects.filter(id=pk).exists()
 
    def test_delete_other_user_message_fails(
        self, other_auth_client, private_message
    ):
        res = other_auth_client.delete(
            f"/api/chat/conversations/messages/{private_message.id}/"
        )
        assert res.status_code == 400
 
    def test_delete_nonexistent_message(self, auth_client):
        res = auth_client.delete("/api/chat/conversations/messages/99999/")
        assert res.status_code == 400
 

 # AUCTION CHAT — ROOM
 
@pytest.mark.django_db
class TestAuctionRoom:
 
    def test_get_room_success(self, auth_client, auction):
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/room/")
        assert res.status_code == 200
        assert res.data["success"] is True
        assert res.data["data"]["auction"] == auction.id
 
    def test_get_room_creates_if_not_exists(self, auth_client, auction):
        from apps.chat.models import ChatRoom
        assert not ChatRoom.objects.filter(auction=auction).exists()
 
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/room/")
        assert res.status_code == 200
        assert ChatRoom.objects.filter(auction=auction).exists()
 
    def test_get_room_idempotent(self, auth_client, auction):
        from apps.chat.models import ChatRoom
        auth_client.get(f"/api/chat/auctions/{auction.id}/room/")
        auth_client.get(f"/api/chat/auctions/{auction.id}/room/")
        assert ChatRoom.objects.filter(auction=auction).count() == 1
 

# AUCTION CHAT — MESSAGES
 
@pytest.mark.django_db
class TestAuctionRoomMessages:
 
    def test_list_room_messages_success(self, auth_client, auction, room_message):
        """Message history for the room."""
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 1
 
    def test_list_room_messages_excludes_deleted(
        self, auth_client, auction, room_message, deleted_room_message
    ):
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 1
        assert res.data["data"][0]["id"] == room_message.id
 
    def test_list_room_messages_empty(self, auth_client, auction):
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert res.status_code == 200
        assert res.data["data"] == []
 
    def test_list_room_messages_contains_sender(
        self, auth_client, auction, room_message, user
    ):
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        msg = res.data["data"][0]
        assert "sender" in msg
        assert msg["sender"]["id"] == user.id
 

# SEND MESSAGE IN THE ROOM (REST)
 
@pytest.mark.django_db
class TestSendRoomMessage:
 
    def test_send_room_message_success(self, auth_client, auction):
        res = auth_client.post(f"/api/chat/auctions/{auction.id}/send/", {
            "message": "Bom leilão!",
        }, format="json")
        assert res.status_code == 201
        assert res.data["success"] is True
        assert res.data["data"]["message"] == "Bom leilão!"
 
    def test_send_room_message_creates_db_record(self, auth_client, user, auction):
        auth_client.post(f"/api/chat/auctions/{auction.id}/send/", {
            "message": "Mensagem da sala",
        }, format="json")
        assert Message.objects.filter(
            sender=user,
            message="Mensagem da sala",
        ).exists()
 
    def test_send_room_message_creates_room_if_needed(self, auth_client, auction):
        from apps.chat.models import ChatRoom
        assert not ChatRoom.objects.filter(auction=auction).exists()
 
        auth_client.post(f"/api/chat/auctions/{auction.id}/send/", {
            "message": "Primeira mensagem",
        }, format="json")
 
        assert ChatRoom.objects.filter(auction=auction).exists()
 
    def test_send_empty_room_message_fails(self, auth_client, auction):
        res = auth_client.post(f"/api/chat/auctions/{auction.id}/send/", {
            "message": "  ",
        }, format="json")
        assert res.status_code == 400
 
    def test_send_room_message_missing_field(self, auth_client, auction):
        res = auth_client.post(f"/api/chat/auctions/{auction.id}/send/", {}, format="json")
        assert res.status_code == 400
 

# DELETE MESSAGE FROM ROOM (SOFT DELETE)
 
@pytest.mark.django_db
class TestDeleteRoomMessage:
 
    def test_soft_delete_own_message_success(self, auth_client, room_message):
        res = auth_client.delete(
            f"/api/chat/auctions/messages/{room_message.id}/"
        )
        assert res.status_code == 200
        assert res.data["success"] is True
 
    def test_soft_delete_marks_is_deleted(self, auth_client, room_message):
        auth_client.delete(f"/api/chat/auctions/messages/{room_message.id}/")
        room_message.refresh_from_db()
        assert room_message.is_deleted is True
 
    def test_soft_delete_keeps_record_in_db(self, auth_client, room_message):
        pk = room_message.id
        auth_client.delete(f"/api/chat/auctions/messages/{pk}/")
        assert Message.objects.filter(id=pk).exists()
 
    def test_soft_delete_other_user_message_fails(
        self, other_auth_client, room_message
    ):
        res = other_auth_client.delete(
            f"/api/chat/auctions/messages/{room_message.id}/"
        )
        assert res.status_code == 400
 
    def test_soft_delete_nonexistent_message(self, auth_client):
        res = auth_client.delete("/api/chat/auctions/messages/99999/")
        assert res.status_code == 400
 
    def test_deleted_message_hidden_from_history(
        self, auth_client, auction, room_message
    ):
        res_before = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert len(res_before.data["data"]) == 1
 
        auth_client.delete(f"/api/chat/auctions/messages/{room_message.id}/")
 
        res_after = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert len(res_after.data["data"]) == 0

    def test_list_room_messages_excludes_blocked_users(
        self, auth_client, auction, room_message, user, other_user
    ):
        """Messages of blocked users should be excluded from room history."""
        from apps.chat.models import Message
        from apps.chat.selectors import get_or_create_auction_room
        room, _ = get_or_create_auction_room(auction_id=auction.id)
        msg2 = Message.objects.create(
            room=room,
            sender=other_user,
            message="Mensagem de usuário bloqueado"
        )

        # viewer (user) blocks other_user
        from apps.social.models import Friendship, FriendshipStatus
        Friendship.objects.create(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.BLOCKED
        )

        # user fetches history
        res = auth_client.get(f"/api/chat/auctions/{auction.id}/messages/")
        assert res.status_code == 200
        ids = [msg["id"] for msg in res.data["data"]]
        assert room_message.id in ids
        assert msg2.id not in ids
 