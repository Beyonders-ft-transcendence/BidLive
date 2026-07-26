import logging
import time
from collections import defaultdict

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from apps.chat.models import Message, PrivateMessage
from apps.chat.selectors import get_or_create_auction_room, get_or_create_private_conversation
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user
from apps.social.selectors import are_friends, get_blocked_user_ids, is_blocked
from apps.users.models import User

from apps.chat.services import _has_trade_relationship


logger = logging.getLogger(__name__)

WS_MESSAGE_MAX_LENGTH = 2000
WS_RATE_LIMIT_WINDOW = 10  # seconds
WS_RATE_LIMIT_MAX_MESSAGES = 10  # max messages per window


class _RateLimiter:
    """Simple sliding-window rate limiter per user across consumers."""

    def __init__(self):
        self._timestamps: dict[int, list[float]] = defaultdict(list)

    def is_rate_limited(self, user_id: int) -> bool:
        now = time.monotonic()
        cutoff = now - WS_RATE_LIMIT_WINDOW
        timestamps = self._timestamps[user_id]
        self._timestamps[user_id] = [t for t in timestamps if t > cutoff]
        if len(self._timestamps[user_id]) >= WS_RATE_LIMIT_MAX_MESSAGES:
            return True
        self._timestamps[user_id].append(now)
        return False


_rate_limiter = _RateLimiter()


def private_group_name(user_id_1: int, user_id_2: int) -> str:
    uid1, uid2 = sorted([user_id_1, user_id_2])
    return f"private_{uid1}_{uid2}"


def auction_chat_group_name(auction_id: int) -> str:
    return f"auction_chat_{auction_id}"


class PrivateChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        try:
            self.recipient_id = int(self.scope["url_route"]["kwargs"]["recipient_id"])
            user = self.scope.get("user")

            if not user or not user.is_authenticated:
                logger.warning("WS PrivateChat — utilizador não autenticado")
                await self.close(code=4401)
                return

            self.user = user

            if self.channel_layer is None:
                logger.error("WS PrivateChat — channel_layer é None (Redis offline?)")
                await self.close(code=4500)
                return

            recipient_exists = await sync_to_async(
                User.objects.filter(id=self.recipient_id, is_active=True).exists
            )()

            if not recipient_exists:
                logger.warning(f"WS PrivateChat — destinatário {self.recipient_id} não existe")
                await self.close(code=4404)
                return

            self.group_name = private_group_name(user.id, self.recipient_id)

            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await sync_to_async(User.objects.filter(id=user.id).update)(
                is_online=True, last_seen=timezone.now()
            )

            await self.accept()
            logger.info(f"WS PrivateChat CONNECTED — {user.email} → recipient {self.recipient_id} | group: {self.group_name}")

        except Exception as e:
            logger.error(f"WS PrivateChat connect() ERROR — {type(e).__name__}: {e}")
            await self.close(code=4500)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name") and self.channel_layer:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if hasattr(self, "user"):
            await sync_to_async(User.objects.filter(id=self.user.id).update)(
                is_online=False, last_seen=timezone.now()
            )

    async def receive_json(self, content: dict):
        event_type = content.get("type")

        if event_type == "chat.message":
            await self._handle_message(content)
        elif event_type == "chat.typing":
            await self._handle_typing(content)
        elif event_type == "chat.read":
            await self._handle_read()
        else:
            await self.send_json({"error": f"Evento desconhecido: {event_type}"})

    async def _handle_message(self, content: dict):
        text = content.get("message", "").strip()
        if not text:
            await self.send_json({"error": "Mensagem vazia."})
            return

        if len(text) > WS_MESSAGE_MAX_LENGTH:
            await self.send_json({"error": f"Mensagem excede o limite de {WS_MESSAGE_MAX_LENGTH} caracteres."})
            return

        if _rate_limiter.is_rate_limited(self.user.id):
            await self.send_json({"error": "Rate limit excedido. Aguarda uns segundos."})
            return

        recipient = await sync_to_async(User.objects.get)(id=self.recipient_id)

        blocked = await sync_to_async(is_blocked)(
            user=self.user, other_user=recipient
        )
        if blocked:
            await self.send_json({"error": "Não podes enviar mensagem a este utilizador."})
            return

        friends = await sync_to_async(are_friends)(
            user=self.user, other_user=recipient
        )
        has_trade = await sync_to_async(_has_trade_relationship)(
            self.user, recipient
        )
        if not friends and not has_trade:
            await self.send_json({"error": "Só podes enviar mensagens privadas a amigos ou parceiros de leilão."})
            return

        recommend_friendship = has_trade and not friends

        conversation, _ = await sync_to_async(get_or_create_private_conversation)(
            user_one=self.user,
            user_two=recipient,
        )

        message = await sync_to_async(PrivateMessage.objects.create)(
            conversation=conversation,
            sender=self.user,
            message=text,
            is_read=False,
        )

        await sync_to_async(notify_user)(
            user=recipient,
            notification_type=NotificationType.MESSAGE,
            title=f"Nova mensagem de {self.user.full_name or self.user.username}",
            content=text[:100],
        )

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message_id": message.id,
                "conversation_id": message.conversation_id,
                "message": text,
                "sender_id": self.user.id,
                "sender_username": self.user.username,
                "sender_avatar": self.user.avatar_url or "",
                "recommend_friendship": recommend_friendship,
                "created_at": message.created_at.isoformat(),
            },
        )

    async def _handle_typing(self, content: dict):
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.typing",
                "user_id": self.user.id,
                "username": self.user.username,
                "is_typing": content.get("is_typing", True),
            },
        )

    async def _handle_read(self):
        await sync_to_async(
            PrivateMessage.objects.filter(
                conversation__user_one_id=min(self.user.id, self.recipient_id),
                conversation__user_two_id=max(self.user.id, self.recipient_id),
                is_read=False,
            ).exclude(sender=self.user).update
        )(is_read=True)

        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.read", "reader_id": self.user.id},
        )

    async def chat_message(self, event: dict):
        await self.send_json({
            "type": "chat.message",
            "message_id": event["message_id"],
            "conversation_id": event.get("conversation_id"),
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_username": event["sender_username"],
            "sender_avatar": event["sender_avatar"],
            "recommend_friendship": event.get("recommend_friendship", False),
            "created_at": event["created_at"],
        })

    async def chat_typing(self, event: dict):
        await self.send_json({
            "type": "chat.typing",
            "user_id": event["user_id"],
            "username": event["username"],
            "is_typing": event["is_typing"],
        })

    async def chat_read(self, event: dict):
        await self.send_json({
            "type": "chat.read",
            "reader_id": event["reader_id"],
        })


class AuctionChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        try:
            self.auction_id = int(self.scope["url_route"]["kwargs"]["auction_id"])
            user = self.scope.get("user")

            if not user or not user.is_authenticated:
                logger.warning("WS AuctionChat — utilizador não autenticado")
                await self.close(code=4401)
                return

            self.user = user

            if self.channel_layer is None:
                logger.error("WS AuctionChat — channel_layer é None (Redis offline?)")
                await self.close(code=4500)
                return

            from apps.auctions.models import Auction
            auction_exists = await sync_to_async(
                Auction.objects.filter(id=self.auction_id).exists
            )()
            if not auction_exists:
                logger.warning(f"WS AuctionChat — leilão {self.auction_id} não existe")
                await self.close(code=4404)
                return

            self.blocked_user_ids = await sync_to_async(get_blocked_user_ids)(user=user)

            self.group_name = auction_chat_group_name(self.auction_id)
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            await sync_to_async(User.objects.filter(id=user.id).update)(
                is_online=True, last_seen=timezone.now()
            )

            await self.accept()
            logger.info(f"WS AuctionChat CONNECTED — {user.email} | auction {self.auction_id} | group: {self.group_name}")

        except Exception as e:
            logger.error(f"WS AuctionChat connect() ERROR — {type(e).__name__}: {e}")
            await self.close(code=4500)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name") and self.channel_layer:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if hasattr(self, "user"):
            await sync_to_async(User.objects.filter(id=self.user.id).update)(
                is_online=False, last_seen=timezone.now()
            )

    async def receive_json(self, content: dict):
        event_type = content.get("type")

        if event_type == "chat.message":
            await self._handle_message(content)
        elif event_type == "chat.typing":
            await self._handle_typing(content)
        else:
            await self.send_json({"error": f"Evento desconhecido: {event_type}"})

    async def _handle_message(self, content: dict):
        text = content.get("message", "").strip()
        if not text:
            await self.send_json({"error": "Mensagem vazia."})
            return

        if len(text) > WS_MESSAGE_MAX_LENGTH:
            await self.send_json({"error": f"Mensagem excede o limite de {WS_MESSAGE_MAX_LENGTH} caracteres."})
            return

        if _rate_limiter.is_rate_limited(self.user.id):
            await self.send_json({"error": "Rate limit excedido. Aguarda uns segundos."})
            return

        room, _ = await sync_to_async(get_or_create_auction_room)(
            auction_id=self.auction_id
        )

        message = await sync_to_async(Message.objects.create)(
            room=room,
            sender=self.user,
            message=text,
        )

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message_id": message.id,
                "message": text,
                "sender_id": self.user.id,
                "sender_username": self.user.username,
                "sender_avatar": self.user.avatar_url or "",
                "created_at": message.created_at.isoformat(),
            },
        )

    async def _handle_typing(self, content: dict):
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.typing",
                "user_id": self.user.id,
                "username": self.user.username,
                "is_typing": content.get("is_typing", True),
            },
        )

    async def chat_message(self, event: dict):
        sender_id = event.get("sender_id")
        if sender_id and sender_id in getattr(self, "blocked_user_ids", set()):
            return

        await self.send_json({
            "type": "chat.message",
            "message_id": event["message_id"],
            "message": event["message"],
            "sender_id": event["sender_id"],
            "sender_username": event["sender_username"],
            "sender_avatar": event["sender_avatar"],
            "created_at": event["created_at"],
        })

    async def chat_typing(self, event: dict):
        await self.send_json({
            "type": "chat.typing",
            "user_id": event["user_id"],
            "username": event["username"],
            "is_typing": event["is_typing"],
        })
        