from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache


def auction_group_name(*, auction_id: int) -> str:
    return f"auction:{auction_id}"


def publish_auction_event(*, auction_id: int, event_type: str, payload: dict) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        auction_group_name(auction_id=auction_id),
        {
            "type": "auction.event",
            "event": event_type,
            "payload": payload,
        },
    )


def publish_auction_snapshot(*, auction_id: int, snapshot: dict, ttl: int = 60) -> None:
    cache.set(f"auction:{auction_id}:snapshot", snapshot, timeout=ttl)
