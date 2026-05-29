from datetime import date, datetime, time
from decimal import Decimal
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from apps.auctions.models import LiveStream, LiveStreamStatus
from apps.auctions.services import (
    end_stream,
    get_stream_snapshot,
    join_stream,
    leave_stream,
    publish_webrtc_signal,
)
from apps.users.authorization_service import user_has_permission


def _normalize_payload(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: _normalize_payload(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_normalize_payload(item) for item in value]
    return value


@sync_to_async
def _get_stream(*, auction_id: int, stream_id: int) -> LiveStream:
    return LiveStream.objects.select_related("auction", "streamer", "thumbnail", "auction__item").get(
        auction_id=auction_id,
        pk=stream_id,
    )


@sync_to_async
def _has_stream_read_permission(user) -> bool:
    return user_has_permission(user=user, permission_name="auction.read")


@sync_to_async
def _can_manage_stream(user, stream: LiveStream) -> bool:
    if stream.auction.item.seller_id == user.id:
        return True
    if stream.streamer_id == user.id:
        return True
    return user_has_permission(user=user, permission_name="auction.manage")


@sync_to_async
def _join_stream(stream: LiveStream, viewer):
    return join_stream(stream=stream, viewer=viewer)


@sync_to_async
def _leave_stream(stream: LiveStream, viewer):
    return leave_stream(stream=stream, viewer=viewer)


@sync_to_async
def _end_stream(*, actor, stream: LiveStream, reason: str):
    return end_stream(actor=actor, stream=stream, reason=reason)


@sync_to_async
def _snapshot(stream: LiveStream) -> dict:
    return get_stream_snapshot(stream=stream)


class StreamConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.auction_id = int(self.scope["url_route"]["kwargs"]["auction_id"])
        self.stream_id = int(self.scope["url_route"]["kwargs"]["stream_id"])
        self.user = self.scope.get("user")
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4401)
            return

        self.stream = await _get_stream(auction_id=self.auction_id, stream_id=self.stream_id)
        has_permission = await _has_stream_read_permission(self.user) or await _can_manage_stream(self.user, self.stream)
        if not has_permission:
            await self.close(code=4403)
            return

        self.role = parse_qs(self.scope.get("query_string", b"").decode("utf-8")).get("role", ["viewer"])[0]
        self.is_streamer_session = self.role == "streamer"
        if self.stream.visibility == "PRIVATE":
            can_manage = await _can_manage_stream(self.user, self.stream)
            if not can_manage:
                await self.close(code=4403)
                return

        if not self.is_streamer_session and self.stream.status != LiveStreamStatus.LIVE:
            await self.close(code=4403)
            return

        self.group_name = f"stream_{self.stream_id}"
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        self.snapshot = _normalize_payload(await _snapshot(self.stream))
        await self.send_json({"event": "stream_snapshot", "payload": self.snapshot})

        if self.stream.status == LiveStreamStatus.LIVE or self.is_streamer_session:
            await _join_stream(self.stream, self.user)

    async def disconnect(self, close_code):
        if not hasattr(self, "group_name"):
            return

        if getattr(self, "is_streamer_session", False) and self.stream.status == LiveStreamStatus.LIVE:
            await _end_stream(actor=self.user, stream=self.stream, reason="streamer_disconnected")
        else:
            await _leave_stream(self.stream, self.user)

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action") or content.get("event")
        if action == "ping":
            await self.send_json({"event": "pong", "payload": {"stream_id": self.stream_id}})
            return
        if action in {"webrtc_offer", "webrtc_answer", "ice_candidate"}:
            payload = {
                "stream_id": self.stream_id,
                "auction_id": self.auction_id,
                "sender": {
                    "id": self.user.id,
                    "username": self.user.username,
                },
                "payload": content.get("payload") or content,
            }
            await sync_to_async(publish_webrtc_signal)(
                stream=self.stream,
                event_type=action,
                payload=payload,
            )
            return
        if action == "heartbeat":
            await self.send_json({"event": "pong", "payload": {"stream_id": self.stream_id}})
            return
        await self.send_json(
            {
                "event": "stream_error",
                "payload": {"errors": [{"action": ["Unsupported websocket action."]}]},
            }
        )

    async def stream_event(self, event):
        await self.send_json({"event": event.get("event"), "payload": event.get("payload")})
