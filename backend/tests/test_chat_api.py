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
 