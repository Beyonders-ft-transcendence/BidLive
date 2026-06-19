import pytest
from datetime import timedelta
 
from django.utils import timezone
from rest_framework.test import APIClient
 
from apps.auctions.models import Auction, AuctionItem, AuctionStatus
from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage
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


# Friendship fixtures — pre-created states

@pytest.fixture()
def friendship_pending(user, other_user):
    """Pending friendship request: user → other_user."""
    return Friendship.objects.create(
        requester=user,
        addressee=other_user,
        status=FriendshipStatus.PENDING,
    )


@pytest.fixture()
def friendship_accepted(user, other_user):
    """Accepted friendship: user → other_user."""
    return Friendship.objects.create(
        requester=user,
        addressee=other_user,
        status=FriendshipStatus.ACCEPTED,
    )


@pytest.fixture()
def friendship_blocked(user, other_user):
    """Blocking: user blocked other_user."""
    return Friendship.objects.create(
        requester=user,
        addressee=other_user,
        status=FriendshipStatus.BLOCKED,
    )


# Private chat
 
@pytest.fixture()
def private_conversation(user, other_user):

    uid1, uid2 = sorted([user.id, other_user.id])
    return PrivateConversation.objects.create(user_one_id=uid1, user_two_id=uid2)
 
 
@pytest.fixture()
def private_message(private_conversation, user):
    return PrivateMessage.objects.create(
        conversation=private_conversation,
        sender=user,
        message="Olá, tudo bem?",
        is_read=False,
    )
 
 
@pytest.fixture()
def read_private_message(private_conversation, user):
    return PrivateMessage.objects.create(
        conversation=private_conversation,
        sender=user,
        message="Mensagem já lida",
        is_read=True,
    )
 

# Auction chat
 
@pytest.fixture()
def auction_item(user):
    return AuctionItem.objects.create(
        seller=user,
        title="Produto de teste",
        starting_price="100.00",
        current_price="100.00",
        minimum_increment="1.00",
    )
 
 
@pytest.fixture()
def auction(auction_item):
    now = timezone.now()
    return Auction.objects.create(
        item=auction_item,
        start_time=now,
        end_time=now + timedelta(hours=2),
        status=AuctionStatus.LIVE,
    )
 
 
@pytest.fixture()
def chat_room(auction):
    return ChatRoom.objects.create(
        auction=auction,
        name=f"Auction {auction.id} Chat",
    )
 
 
@pytest.fixture()
def room_message(chat_room, user):
    return Message.objects.create(
        room=chat_room,
        sender=user,
        message="Lance interessante!",
        is_deleted=False,
    )
 
 
@pytest.fixture()
def deleted_room_message(chat_room, user):
    return Message.objects.create(
        room=chat_room,
        sender=user,
        message="Mensagem apagada",
        is_deleted=True,
    )
 