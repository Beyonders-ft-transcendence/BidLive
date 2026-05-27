from datetime import date, datetime, time
from decimal import Decimal
from math import ceil

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.utils import timezone

from apps.auctions.events import AUCTION_SNAPSHOT
from apps.auctions.models import AuctionStatus


def auction_group_name(*, auction_id: int) -> str:
    return f"auction_{auction_id}"


def _snapshot_cache_key(*, auction_id: int) -> str:
    return f"auction:{auction_id}:snapshot"


def _presence_cache_key(*, auction_id: int) -> str:
    return f"auction:{auction_id}:presence"


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


def _user_payload(user) -> dict | None:
    if user is None:
        return None
    return {
        "id": user.id,
        "username": user.username,
        "full_name": getattr(user, "full_name", ""),
    }


def get_seconds_remaining(*, auction) -> int:
    return max(0, ceil((auction.end_time - timezone.now()).total_seconds()))


def get_auction_presence(*, auction_id: int) -> int:
    return max(0, int(cache.get(_presence_cache_key(auction_id=auction_id), 0) or 0))


def increment_auction_presence(*, auction_id: int) -> int:
    cache_key = _presence_cache_key(auction_id=auction_id)
    if cache.add(cache_key, 1, timeout=None):
        return 1
    try:
        return max(0, int(cache.incr(cache_key)))
    except ValueError:
        cache.set(cache_key, 1, timeout=None)
        return 1


def decrement_auction_presence(*, auction_id: int) -> int:
    cache_key = _presence_cache_key(auction_id=auction_id)
    current = int(cache.get(cache_key, 0) or 0)
    if current <= 1:
        cache.delete(cache_key)
        return 0
    try:
        return max(0, int(cache.decr(cache_key)))
    except ValueError:
        cache.delete(cache_key)
        return 0


def build_bid_payload(*, bid, auction=None) -> dict:
    auction = auction or bid.auction
    return {
        "auction_id": auction.id,
        "bid_id": bid.id,
        "bid_amount": bid.amount,
        "current_price": auction.item.current_price,
        "bidder": _user_payload(bid.bidder),
        "is_buy_now": bid.is_buy_now,
        "metadata": bid.metadata or {},
        "timestamp": bid.created_at,
        "watcher_count": auction.watchers.count(),
        "active_connections": get_auction_presence(auction_id=auction.id),
    }


def build_outbid_payload(*, auction, outbid_bid, current_bid) -> dict:
    return {
        "auction_id": auction.id,
        "message": "Seu lance foi ultrapassado.",
        "outbid_user_id": outbid_bid.bidder_id,
        "outbid_user": _user_payload(outbid_bid.bidder),
        "current_bid_id": current_bid.id,
        "current_price": auction.item.current_price,
        "bid_amount": current_bid.amount,
        "bidder": _user_payload(current_bid.bidder),
        "timestamp": current_bid.created_at,
    }


def build_timer_payload(*, auction) -> dict:
    return {
        "auction_id": auction.id,
        "status": auction.status,
        "end_time": auction.end_time,
        "seconds_remaining": get_seconds_remaining(auction=auction),
    }


def build_presence_payload(*, auction_id: int, user, watcher_count: int, active_connections: int) -> dict:
    return {
        "auction_id": auction_id,
        "user": _user_payload(user),
        "watcher_count": watcher_count,
        "active_connections": active_connections,
    }


def build_auction_snapshot(*, auction) -> dict:
    from apps.auctions.selectors import get_highest_bid_for_auction
    from apps.auctions.services.pricing_service import get_minimum_next_bid

    highest_bid = get_highest_bid_for_auction(auction_id=auction.id)
    return {
        "auction_id": auction.id,
        "status": auction.status,
        "start_time": auction.start_time,
        "end_time": auction.end_time,
        "current_price": auction.item.current_price,
        "highest_bidder": _user_payload(highest_bid.bidder) if highest_bid else None,
        "highest_bid_amount": highest_bid.amount if highest_bid else None,
        "bid_count": auction.bids.count(),
        "watcher_count": auction.watchers.count(),
        "active_connections": get_auction_presence(auction_id=auction.id),
        "winning_bid_id": auction.winning_bid_id,
        "winner_id": auction.winner_id,
        "reserve_met": auction.reserve_met,
        "seconds_remaining": get_seconds_remaining(auction=auction),
        "minimum_next_bid": (
            get_minimum_next_bid(auction=auction)
            if auction.status == AuctionStatus.LIVE
            else None
        ),
    }


def get_auction_snapshot(*, auction_id: int) -> dict | None:
    snapshot = cache.get(_snapshot_cache_key(auction_id=auction_id))
    if snapshot is not None:
        return snapshot

    from apps.auctions.models import Auction

    try:
        auction = Auction.objects.select_related("item").get(pk=auction_id)
    except Auction.DoesNotExist:
        return None

    snapshot = build_auction_snapshot(auction=auction)
    return publish_auction_snapshot(auction_id=auction_id, snapshot=snapshot)


def publish_auction_event(*, auction_id: int, event_type: str, payload: dict) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        auction_group_name(auction_id=auction_id),
        {
            "type": "auction.event",
            "event": event_type,
            "payload": _normalize_payload(payload),
        },
    )


def publish_auction_snapshot(*, auction_id: int, snapshot: dict, ttl: int = 60, broadcast: bool = False) -> dict:
    normalized = _normalize_payload(snapshot)
    cache.set(_snapshot_cache_key(auction_id=auction_id), normalized, timeout=ttl)
    if broadcast:
        publish_auction_event(auction_id=auction_id, event_type=AUCTION_SNAPSHOT, payload=normalized)
    return normalized
