from decimal import Decimal

from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.analytics.services import track_event
from apps.auctions.events import (
    AUCTION_CANCELLED,
    AUCTION_CREATED,
    AUCTION_ENDED,
    AUCTION_STARTED,
    AUCTION_UPDATED,
    BID_CREATED,
    BUY_NOW_COMPLETED,
    OUTBID,
    TIMER_UPDATED,
)
from apps.auctions.models import (
    Auction,
    AuctionAuditLog,
    AuctionItem,
    AuctionStatus,
    AuctionWatcher,
    Bid,
    LiveStreamStatus,
)
from apps.auctions.selectors import get_highest_bid_for_auction
from apps.auctions.services.anti_spam_service import enforce_bid_rate_limit
from apps.auctions.services.image_service import attach_images, set_primary_image
from apps.auctions.services.pricing_service import ensure_bid_is_valid
from apps.auctions.services.realtime_service import (
    build_auction_snapshot,
    build_bid_payload,
    build_outbid_payload,
    build_timer_payload,
    publish_auction_event,
    publish_auction_snapshot,
    publish_global_event,
)
from apps.auctions.services.scheduling_service import schedule_auction_activation, schedule_auction_close
from apps.auctions.services.winner_service import determine_winner
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_auction_watchers, notify_outbid, notify_user
from apps.users.authorization_service import log_permission_audit, user_has_permission
from apps.users.models import UserStatus


def _auction_lock_key(auction_id: int) -> str:
    return f"auction:{auction_id}:lock"


class _NoOpLock:
    def acquire(self, blocking=True):
        return True

    def release(self):
        return None


def _acquire_lock(*, auction_id: int):
    if not hasattr(cache, "lock"):
        return _NoOpLock()
    lock_timeout = int(getattr(settings, "AUCTION_LOCK_TIMEOUT", 10))
    blocking_timeout = int(getattr(settings, "AUCTION_LOCK_BLOCKING_TIMEOUT", 5))
    return cache.lock(_auction_lock_key(auction_id), timeout=lock_timeout, blocking_timeout=blocking_timeout)


def _ensure_owner_or_manager(*, user, auction: Auction) -> None:
    if auction.item.seller_id == user.id:
        return
    if user_has_permission(user=user, permission_name="auction.manage"):
        return
    if user.has_role("admin"):
        return
    raise PermissionDenied({"permission": ["Not allowed to manage this auction."]})


def _record_bid_rejection(*, auction: Auction, bidder, reason: str, ip_address: str = "", metadata: dict | None = None) -> None:
    AuctionAuditLog.objects.create(
        auction=auction,
        actor=bidder,
        action="auction.bid_rejected",
        metadata={"reason": reason, **(metadata or {})},
    )
    track_event(
        user=bidder,
        event_type="auction.bid_rejected",
        metadata={"auction_id": auction.id, "reason": reason, **(metadata or {})},
        ip_address=ip_address,
    )


def _ensure_bidder_can_bid(*, bidder, auction: Auction, ip_address: str = "") -> None:
    if getattr(bidder, "status", UserStatus.ACTIVE) in (UserStatus.BANNED, UserStatus.SUSPENDED) or not bidder.is_active:
        _record_bid_rejection(auction=auction, bidder=bidder, reason="user_blocked", ip_address=ip_address)
        raise ValidationError({"bidder": ["User is not allowed to place bids."]})
    if bidder.id == auction.item.seller_id:
        _record_bid_rejection(auction=auction, bidder=bidder, reason="self_bidding", ip_address=ip_address)
        raise ValidationError({"bidder": ["Seller cannot bid on their own auction."]})


def _ensure_auction_is_biddable(*, auction: Auction, bidder, ip_address: str = "") -> None:
    if auction.status == AuctionStatus.CANCELLED:
        _record_bid_rejection(auction=auction, bidder=bidder, reason="auction_cancelled", ip_address=ip_address)
        raise ValidationError({"status": ["Auction was cancelled."]})
    if auction.status == AuctionStatus.SOLD:
        _record_bid_rejection(auction=auction, bidder=bidder, reason="buy_now_completed", ip_address=ip_address)
        raise ValidationError({"status": ["Auction is already sold."]})
    if auction.status == AuctionStatus.ENDED:
        _record_bid_rejection(auction=auction, bidder=bidder, reason="auction_ended", ip_address=ip_address)
        raise ValidationError({"status": ["Auction has already ended."]})
    if auction.status not in (AuctionStatus.LIVE, AuctionStatus.ACTIVE):
        _record_bid_rejection(auction=auction, bidder=bidder, reason="auction_not_active", ip_address=ip_address)
        raise ValidationError({"status": ["Auction is not active or live."]})
    if auction.end_time <= timezone.now():
        _record_bid_rejection(auction=auction, bidder=bidder, reason="auction_expired", ip_address=ip_address)
        raise ValidationError({"status": ["Auction has already ended."]})


def _publish_snapshot(*, auction: Auction, broadcast: bool = False) -> None:
    publish_auction_snapshot(
        auction_id=auction.id,
        snapshot=build_auction_snapshot(auction=auction),
        broadcast=broadcast,
    )


@transaction.atomic
def create_auction(*, seller, data: dict, image_urls=None, ip_address: str = "") -> Auction:
    image_urls = image_urls or []
    item = AuctionItem.objects.create(
        seller=seller,
        title=data["title"],
        description=data.get("description", ""),
        category=data.get("category"),
        category_label=data.get("category").name if data.get("category") else "",
        starting_price=data["starting_price"],
        current_price=data["starting_price"],
        minimum_increment=data["minimum_increment"],
        reserve_price=data.get("reserve_price"),
        buy_now_price=data.get("buy_now_price"),
        condition_type=data.get("condition_type"),
    )

    now = timezone.now()
    if data.get("is_draft"):
        status = AuctionStatus.DRAFT
    else:
        status = AuctionStatus.SCHEDULED if data["start_time"] > now else AuctionStatus.ACTIVE
    auction = Auction.objects.create(
        item=item,
        start_time=data["start_time"],
        end_time=data["end_time"],
        status=status,
        rules=data.get("rules"),
        started_at=now if status in (AuctionStatus.ACTIVE, AuctionStatus.LIVE) else None,
    )

    attach_images(item=item, image_urls=image_urls)

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=seller,
        action="auction.created",
        metadata={"status": auction.status},
    )
    log_permission_audit(
        actor=seller,
        action="auction.create",
        resource_type="auction",
        resource_id=auction.id,
        ip_address=ip_address,
    )
    track_event(user=seller, event_type="auction.created", metadata={"auction_id": auction.id})

    if status == AuctionStatus.SCHEDULED:
        schedule_auction_activation(auction_id=auction.id, start_time=auction.start_time)
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)
    if status in (AuctionStatus.ACTIVE, AuctionStatus.LIVE):
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_CREATED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    _publish_snapshot(auction=auction, broadcast=True)
    return auction


@transaction.atomic
def update_auction(
    *,
    actor,
    auction: Auction,
    data: dict,
    image_urls=None,
    ip_address: str = "",
) -> Auction:
    _ensure_owner_or_manager(user=actor, auction=auction)
    if auction.status not in (AuctionStatus.DRAFT, AuctionStatus.SCHEDULED):
        raise ValidationError({"status": ["Auction cannot be edited after it starts."]})
    if auction.bids.exists():
        raise ValidationError({"bids": ["Auction with bids cannot be edited."]})

    if "start_time" in data or "end_time" in data:
        new_start = data.get("start_time", auction.start_time)
        new_end = data.get("end_time", auction.end_time)
        if new_end <= new_start:
            raise ValidationError({"end_time": ["End time must be after start time."]})
        auction.start_time = new_start
        auction.end_time = new_end

    if auction.status == AuctionStatus.DRAFT and data.get("publish"):
        auction.status = (
            AuctionStatus.SCHEDULED if auction.start_time > timezone.now() else AuctionStatus.ACTIVE
        )
        if auction.status == AuctionStatus.ACTIVE:
            auction.started_at = timezone.now()

    if "rules" in data:
        auction.rules = data.get("rules")

    item = auction.item
    if "description" in data:
        item.description = data.get("description")
    if "category" in data:
        item.category = data.get("category")
        item.category_label = data.get("category").name if data.get("category") else ""
    if "buy_now_price" in data:
        if data.get("buy_now_price") is not None and data.get("buy_now_price") < item.current_price:
            raise ValidationError({"buy_now_price": ["Buy now must be >= current price."]})
        item.buy_now_price = data.get("buy_now_price")
    if "reserve_price" in data:
        if data.get("reserve_price") is not None and data.get("reserve_price") < item.starting_price:
            raise ValidationError({"reserve_price": ["Reserve price must be >= starting price."]})
        item.reserve_price = data.get("reserve_price")

    item.save()
    auction.save()

    image_urls = image_urls or []
    if image_urls:
        attach_images(item=item, image_urls=image_urls)
    if "primary_image_id" in data:
        set_primary_image(item=item, image_id=data["primary_image_id"])

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=actor,
        action="auction.updated",
        metadata={"fields": list(data.keys())},
    )
    log_permission_audit(
        actor=actor,
        action="auction.update",
        resource_type="auction",
        resource_id=auction.id,
        metadata={"fields": list(data.keys())},
        ip_address=ip_address,
    )
    track_event(user=actor, event_type="auction.updated", metadata={"auction_id": auction.id})

    if auction.status == AuctionStatus.SCHEDULED:
        schedule_auction_activation(auction_id=auction.id, start_time=auction.start_time)
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)
    if auction.status in (AuctionStatus.ACTIVE, AuctionStatus.LIVE):
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_UPDATED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    _publish_snapshot(auction=auction, broadcast=True)
    return auction


@transaction.atomic
def cancel_auction(*, actor, auction: Auction, reason: str = "", ip_address: str = "") -> Auction:
    if not (auction.item.seller_id == actor.id or actor.is_superuser):
        raise PermissionDenied({"permission": ["Not allowed to cancel this auction."]})
    if auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
        raise ValidationError({"status": ["Auction is already closed."]})

    has_bids = auction.bids.exists()
    not_started = auction.start_time > timezone.now()
    if not not_started and has_bids:
        raise ValidationError({"bids": ["Auction with bids cannot be cancelled after start."]})

    auction.status = AuctionStatus.CANCELLED
    auction.cancelled_at = timezone.now()
    auction.cancelled_by = actor
    auction.cancel_reason = reason
    auction.save(update_fields=["status", "cancelled_at", "cancelled_by", "cancel_reason", "updated_at"])

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=actor,
        action="auction.cancelled",
        metadata={"reason": reason},
    )
    log_permission_audit(
        actor=actor,
        action="auction.cancel",
        resource_type="auction",
        resource_id=auction.id,
        metadata={"reason": reason},
        ip_address=ip_address,
    )
    track_event(user=actor, event_type="auction.cancelled", metadata={"auction_id": auction.id})

    notify_auction_watchers(
        auction=auction,
        notification_type=NotificationType.AUCTION_ENDED,
        title="Auction cancelled",
        content=f"Auction {auction.id} was cancelled.",
    )

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_CANCELLED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    _publish_snapshot(auction=auction, broadcast=True)
    return auction


def place_bid(
    *,
    bidder,
    auction: Auction,
    amount: Decimal,
    ip_address: str = "",
    metadata: dict | None = None,
) -> Bid:
    metadata = metadata or {}
    _ensure_bidder_can_bid(bidder=bidder, auction=auction, ip_address=ip_address)
    enforce_bid_rate_limit(auction_id=auction.id, user=bidder, ip_address=ip_address)
    lock = _acquire_lock(auction_id=auction.id)
    if not lock.acquire(blocking=True):
        raise ValidationError({"auction": ["Auction is busy. Try again."]})

    try:
        with transaction.atomic():
            auction = Auction.objects.select_for_update().select_related("item").get(pk=auction.id)
            _ensure_auction_is_biddable(auction=auction, bidder=bidder, ip_address=ip_address)
            ensure_bid_is_valid(auction=auction, amount=amount)

            previous_highest = get_highest_bid_for_auction(auction_id=auction.id)
            bid = Bid.objects.create(
                auction=auction,
                bidder=bidder,
                amount=amount,
                ip_address=ip_address,
                metadata=metadata,
            )
            auction.item.current_price = amount
            auction.item.save(update_fields=["current_price", "updated_at"])

            AuctionAuditLog.objects.create(
                auction=auction,
                actor=bidder,
                action="auction.bid",
                metadata={"amount": str(amount), "ip_address": ip_address, "metadata": metadata},
            )
            track_event(
                user=bidder,
                event_type="auction.bid",
                metadata={"auction_id": auction.id, "amount": str(amount), "metadata": metadata},
                ip_address=ip_address,
            )

            notify_auction_watchers(
                auction=auction,
                notification_type=NotificationType.NEW_BID,
                title="New bid",
                content=f"Auction {auction.id} received a new bid.",
                exclude_user_ids=[bidder.id],
            )
            if previous_highest and previous_highest.bidder_id != bidder.id:
                notify_outbid(user=previous_highest.bidder, auction=auction)
                publish_auction_event(
                    auction_id=auction.id,
                    event_type=OUTBID,
                    payload=build_outbid_payload(
                        auction=auction,
                        outbid_bid=previous_highest,
                        current_bid=bid,
                    ),
                )

            publish_auction_event(
                auction_id=auction.id,
                event_type=BID_CREATED,
                payload=build_bid_payload(bid=bid, auction=auction),
            )
            publish_auction_event(
                auction_id=auction.id,
                event_type=TIMER_UPDATED,
                payload=build_timer_payload(auction=auction),
            )
            
            publish_global_event(
                event_type="GLOBAL_BID_CREATED",
                payload={
                    "id": bid.id,
                    "auction_id": auction.id,
                    "auction_title": auction.item.title,
                    "bidder": {
                        "id": bidder.id,
                        "username": bidder.username,
                        "full_name": getattr(bidder, "full_name", ""),
                    },
                    "amount": str(amount),
                    "is_buy_now": bid.is_buy_now,
                    "created_at": bid.created_at.isoformat(),
                }
            )

            _publish_snapshot(auction=auction, broadcast=True)
            return bid
    finally:
        lock.release()


@transaction.atomic
def buy_now(*, buyer, auction: Auction, ip_address: str = "") -> Auction:
    if auction.status not in (AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE, AuctionStatus.LIVE):
        raise ValidationError({"status": ["Auction is not available for buy now."]})
    if auction.item.buy_now_price is None:
        raise ValidationError({"buy_now_price": ["Buy now is not available."]})
    if auction.end_time <= timezone.now():
        raise ValidationError({"status": ["Auction has already ended."]})
    if buyer.id == auction.item.seller_id:
        raise ValidationError({"buyer": ["Seller cannot buy their own auction."]})

    lock = _acquire_lock(auction_id=auction.id)
    if not lock.acquire(blocking=True):
        raise ValidationError({"auction": ["Auction is busy. Try again."]})

    try:
        auction = Auction.objects.select_for_update().select_related("item").get(pk=auction.id)
        if auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
            raise ValidationError({"status": ["Auction is already closed."]})

        amount = auction.item.buy_now_price
        bid = Bid.objects.create(auction=auction, bidder=buyer, amount=amount, is_buy_now=True)
        auction.item.current_price = amount
        auction.item.save(update_fields=["current_price", "updated_at"])

        auction.status = AuctionStatus.SOLD
        auction.winner = buyer
        auction.winning_bid = bid
        auction.buy_now_at = timezone.now()
        auction.buy_now_by = buyer
        auction.ended_at = timezone.now()
        auction.reserve_met = True
        auction.save(
            update_fields=[
                "status",
                "winner",
                "winning_bid",
                "buy_now_at",
                "buy_now_by",
                "ended_at",
                "reserve_met",
                "updated_at",
            ]
        )

        AuctionAuditLog.objects.create(
            auction=auction,
            actor=buyer,
            action="auction.buy_now",
            metadata={"amount": str(amount)},
        )
        log_permission_audit(
            actor=buyer,
            action="auction.buy_now",
            resource_type="auction",
            resource_id=auction.id,
            metadata={"amount": str(amount)},
            ip_address=ip_address,
        )
        track_event(
            user=buyer,
            event_type="auction.buy_now",
            metadata={"auction_id": auction.id, "amount": str(amount)},
            ip_address=ip_address,
        )

        notify_user(
            user=auction.item.seller,
            notification_type=NotificationType.AUCTION_ENDED,
            title="Auction sold",
            content=f"Auction {auction.id} sold via buy now.",
        )
        notify_auction_watchers(
            auction=auction,
            notification_type=NotificationType.AUCTION_ENDED,
            title="Auction sold",
            content=f"Auction {auction.id} sold via buy now.",
            exclude_user_ids=[buyer.id],
        )

        publish_auction_event(
            auction_id=auction.id,
            event_type=BUY_NOW_COMPLETED,
            payload={"auction_id": auction.id, "amount": str(amount)},
        )
        _publish_snapshot(auction=auction, broadcast=True)
        return auction
    finally:
        lock.release()


@transaction.atomic
def activate_auction(*, auction: Auction) -> Auction:
    if auction.status not in (AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE):
        return auction

    if auction.start_time > timezone.now():
        return auction

    new_status = AuctionStatus.ACTIVE

    if auction.status == new_status:
        return auction

    auction.status = new_status
    if not auction.started_at:
        auction.started_at = timezone.now()
    auction.save(update_fields=["status", "started_at", "updated_at"])

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=None,
        action="auction.activated",
        metadata={"scheduled": True, "status": new_status},
    )
    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_STARTED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    _publish_snapshot(auction=auction, broadcast=True)
    return auction


@transaction.atomic
def close_auction(*, auction: Auction) -> Auction:
    if auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
        return auction

    if auction.end_time > timezone.now():
        return auction

    winner_id, winning_bid, reserve_met = determine_winner(auction=auction)
    if winner_id:
        auction.status = AuctionStatus.SOLD
        auction.winner_id = winner_id
        auction.winning_bid = winning_bid
        auction.reserve_met = reserve_met
    else:
        auction.status = AuctionStatus.ENDED
        auction.reserve_met = False

    auction.ended_at = timezone.now()
    auction.save(update_fields=["status", "winner", "winning_bid", "reserve_met", "ended_at", "updated_at"])

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=None,
        action="auction.closed",
        metadata={"reserve_met": reserve_met, "winner_id": winner_id},
    )
    track_event(
        user=auction.winner if auction.winner_id else None,
        event_type="auction.closed",
        metadata={"auction_id": auction.id, "winner_id": winner_id, "reserve_met": reserve_met},
    )

    notify_auction_watchers(
        auction=auction,
        notification_type=NotificationType.AUCTION_ENDED,
        title="Auction ended",
        content=f"Auction {auction.id} has ended.",
    )
    if auction.winner_id:
        notify_user(
            user=auction.winner,
            notification_type=NotificationType.AUCTION_ENDED,
            title="You won the auction",
            content=f"You won auction {auction.id}.",
        )
        notify_user(
            user=auction.item.seller,
            notification_type=NotificationType.AUCTION_ENDED,
            title="Auction sold",
            content=f"Auction {auction.id} has a winner.",
        )

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_ENDED,
        payload={"auction_id": auction.id, "status": auction.status, "winner_id": winner_id},
    )
    _publish_snapshot(auction=auction, broadcast=True)
    return auction


def watch_auction(*, user, auction: Auction) -> AuctionWatcher:
    watcher, created = AuctionWatcher.objects.get_or_create(auction=auction, user=user)
    if created:
        _publish_snapshot(auction=auction, broadcast=True)
    return watcher


def unwatch_auction(*, user, auction: Auction) -> None:
    deleted, _ = AuctionWatcher.objects.filter(auction=auction, user=user).delete()
    if deleted:
        _publish_snapshot(auction=auction, broadcast=True)


def activate_auction_by_id(*, auction_id: int) -> Auction:
    auction = Auction.objects.select_related("item").get(pk=auction_id)
    return activate_auction(auction=auction)


def close_auction_by_id(*, auction_id: int) -> Auction:
    auction = Auction.objects.select_related("item").get(pk=auction_id)
    return close_auction(auction=auction)
