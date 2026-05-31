from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone
 
from apps.chat.models import PrivateConversation, PrivateMessage, Message
from apps.chat.selectors import get_or_create_auction_room, get_or_create_private_conversation
from apps.users.models import User
 
 
def private_group_name(user_id_1: int, user_id_2: int) -> str:
    uid1, uid2 = sorted([user_id_1, user_id_2])
    return f"private_{uid1}_{uid2}"
 
 
def auction_chat_group_name(auction_id: int) -> str:
    return f"auction_chat_{auction_id}"
