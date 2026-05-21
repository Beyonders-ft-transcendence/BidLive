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
)
from apps.auctions.models import (
    Auction,
    AuctionAuditLog,
    AuctionItem,
    AuctionStatus,
    AuctionWatcher,
    Bid,
)
from apps.auctions.services.image_service import attach_images, set_primary_image
from apps.auctions.services.pricing_service import ensure_bid_is_valid
from apps.auctions.services.realtime_service import publish_auction_event, publish_auction_snapshot
from apps.auctions.services.scheduling_service import schedule_auction_activation, schedule_auction_close
from apps.auctions.services.winner_service import determine_winner
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_auction_watchers, notify_outbid, notify_user
from apps.users.authorization_service import log_permission_audit, user_has_permission


def _auction_lock_key(auction_id: int) -> str:
    return f"auction:{auction_id}:lock"


def _acquire_lock(*, auction_id: int):
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


@transaction.atomic
def create_auction(*, seller, data: dict, images=None, ip_address: str = "") -> Auction:
    images = images or []
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
        status = AuctionStatus.SCHEDULED if data["start_time"] > now else AuctionStatus.LIVE
    auction = Auction.objects.create(
        item=item,
        start_time=data["start_time"],
        end_time=data["end_time"],
        status=status,
        rules=data.get("rules"),
        started_at=now if status == AuctionStatus.LIVE else None,
    )

    attach_images(item=item, uploader=seller, images=images)

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
    if status == AuctionStatus.LIVE:
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_CREATED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    publish_auction_snapshot(
        auction_id=auction.id,
        snapshot={"status": auction.status, "start_time": auction.start_time, "end_time": auction.end_time},
    )
    return auction


@transaction.atomic
def update_auction(*, actor, auction: Auction, data: dict, images=None, ip_address: str = "") -> Auction:
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
            AuctionStatus.SCHEDULED if auction.start_time > timezone.now() else AuctionStatus.LIVE
        )
        if auction.status == AuctionStatus.LIVE:
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

    images = images or []
    if images:
        attach_images(item=item, uploader=actor, images=images)
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
    if auction.status == AuctionStatus.LIVE:
        schedule_auction_close(auction_id=auction.id, end_time=auction.end_time)

    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_UPDATED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    publish_auction_snapshot(
        auction_id=auction.id,
        snapshot={"status": auction.status, "start_time": auction.start_time, "end_time": auction.end_time},
    )
    return auction


@transaction.atomic
def cancel_auction(*, actor, auction: Auction, reason: str = "", ip_address: str = "") -> Auction:
    _ensure_owner_or_manager(user=actor, auction=auction)
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
    publish_auction_snapshot(auction_id=auction.id, snapshot={"status": auction.status})
    return auction


@transaction.atomic
def place_bid(*, bidder, auction: Auction, amount: Decimal, ip_address: str = "") -> Bid:
    if auction.status != AuctionStatus.LIVE:
        raise ValidationError({"status": ["Auction is not live."]})
    if auction.end_time <= timezone.now():
        raise ValidationError({"status": ["Auction has already ended."]})
    if bidder.id == auction.item.seller_id:
        raise ValidationError({"bidder": ["Seller cannot bid on their own auction."]})

    lock = _acquire_lock(auction_id=auction.id)
    if not lock.acquire(blocking=True):
        raise ValidationError({"auction": ["Auction is busy. Try again."]})

    try:
        auction = Auction.objects.select_for_update().select_related("item").get(pk=auction.id)
        ensure_bid_is_valid(auction=auction, amount=amount)

        previous_highest = (
            Bid.objects.filter(auction=auction)
            .order_by("-amount", "created_at")
            .select_related("bidder")
            .first()
        )
        bid = Bid.objects.create(auction=auction, bidder=bidder, amount=amount)
        auction.item.current_price = amount
        auction.item.save(update_fields=["current_price", "updated_at"])

        AuctionAuditLog.objects.create(
            auction=auction,
            actor=bidder,
            action="auction.bid",
            metadata={"amount": str(amount)},
        )
        track_event(
            user=bidder,
            event_type="auction.bid",
            metadata={"auction_id": auction.id, "amount": str(amount)},
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
            event_type=BID_CREATED,
            payload={"auction_id": auction.id, "amount": str(amount)},
        )
        publish_auction_snapshot(
            auction_id=auction.id,
            snapshot={
                "status": auction.status,
                "current_price": str(auction.item.current_price),
                "end_time": auction.end_time,
            },
        )
        return bid
    finally:
        lock.release()


@transaction.atomic
def buy_now(*, buyer, auction: Auction, ip_address: str = "") -> Auction:
    if auction.status not in (AuctionStatus.SCHEDULED, AuctionStatus.LIVE):
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
        publish_auction_snapshot(
            auction_id=auction.id,
            snapshot={"status": auction.status, "current_price": str(auction.item.current_price)},
        )
        return auction
    finally:
        lock.release()


@transaction.atomic
def activate_auction(*, auction: Auction) -> Auction:
    if auction.status != AuctionStatus.SCHEDULED:
        return auction
    auction.status = AuctionStatus.LIVE
    auction.started_at = timezone.now()
    auction.save(update_fields=["status", "started_at", "updated_at"])

    AuctionAuditLog.objects.create(
        auction=auction,
        actor=None,
        action="auction.activated",
        metadata={"scheduled": True},
    )
    publish_auction_event(
        auction_id=auction.id,
        event_type=AUCTION_STARTED,
        payload={"auction_id": auction.id, "status": auction.status},
    )
    publish_auction_snapshot(
        auction_id=auction.id,
        snapshot={"status": auction.status, "start_time": auction.start_time, "end_time": auction.end_time},
    )
    return auction


@transaction.atomic
def close_auction(*, auction: Auction) -> Auction:
    if auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
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
    publish_auction_snapshot(
        auction_id=auction.id,
        snapshot={"status": auction.status, "winner_id": winner_id},
    )
    return auction


def watch_auction(*, user, auction: Auction) -> AuctionWatcher:
    watcher, _ = AuctionWatcher.objects.get_or_create(auction=auction, user=user)
    return watcher


def unwatch_auction(*, user, auction: Auction) -> None:
    AuctionWatcher.objects.filter(auction=auction, user=user).delete()


def activate_auction_by_id(*, auction_id: int) -> Auction:
    auction = Auction.objects.select_related("item").get(pk=auction_id)
    return activate_auction(auction=auction)


def close_auction_by_id(*, auction_id: int) -> Auction:
    auction = Auction.objects.select_related("item").get(pk=auction_id)
    return close_auction(auction=auction)
