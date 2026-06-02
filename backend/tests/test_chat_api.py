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
 