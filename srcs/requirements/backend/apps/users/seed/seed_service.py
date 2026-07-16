import hashlib

from django.db import transaction
from django.utils import timezone

from apps.analytics.models import AnalyticsEvent
from apps.auctions.models import (
    Auction,
    AuctionCategory,
    AuctionImage,
    AuctionItem,
    AuctionStatus,
    AuctionWatcher,
    Bid,
    LiveStream,
    LiveStreamStatus,
)
from apps.auctions.services.stream_service import generate_stream_key
from apps.chat.models import ChatRoom, Message
from apps.notifications.models import Notification
from apps.reports.models import Report, ReportReason, ReportStatus, ReportTargetType
from apps.social.models import Friendship, FriendshipStatus

from apps.users.models import User
from apps.users.seed.demo_data import (
    DEMO_ANALYTICS_EVENTS,
    DEMO_AUCTIONS,
    DEMO_EMAIL_DOMAIN,
    DEMO_FRIENDSHIPS,
    DEMO_MESSAGES,
    DEMO_NOTIFICATIONS,
    DEMO_REPORTS,
    DEMO_USERS,
    DemoAuctionSpec,
    hours_from_now,
)
from apps.users.services import assign_role, create_user

_AUCTION_REGISTRY: dict[str, Auction] = {}


def demo_users_exist() -> bool:
    return User.objects.filter(email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").exists()


def _stream_key_hash(stream_key: str) -> str:
    return hashlib.sha256(stream_key.encode("utf-8")).hexdigest()


@transaction.atomic
def clear_demo_data() -> dict[str, int]:
    demo_users = User.objects.filter(email__iendswith=f"@{DEMO_EMAIL_DOMAIN}")
    demo_user_ids = list(demo_users.values_list("id", flat=True))
    counts: dict[str, int] = {}

    if not demo_user_ids:
        return counts

    seller_items = AuctionItem.objects.filter(seller_id__in=demo_user_ids)
    seller_auctions = Auction.objects.filter(item__in=seller_items)
    chat_rooms = ChatRoom.objects.filter(auction__in=seller_auctions)
    counts["messages"] = Message.objects.filter(room__in=chat_rooms).delete()[0]
    counts["chat_rooms"] = chat_rooms.delete()[0]
    counts["reports"] = Report.objects.filter(reporter_id__in=demo_user_ids).delete()[0]
    counts["analytics_events"] = AnalyticsEvent.objects.filter(
        user_id__in=demo_user_ids,
    ).delete()[0]
    counts["bids"] = Bid.objects.filter(auction__in=seller_auctions).delete()[0]
    counts["streams"] = LiveStream.objects.filter(auction__in=seller_auctions).delete()[0]
    counts["watchers"] = AuctionWatcher.objects.filter(auction__in=seller_auctions).delete()[0]
    counts["auctions"] = seller_auctions.delete()[0]
    counts["items"] = seller_items.delete()[0]
    counts["notifications"] = Notification.objects.filter(user_id__in=demo_user_ids).delete()[0]
    counts["friendships"] = Friendship.objects.filter(
        requester_id__in=demo_user_ids,
        addressee_id__in=demo_user_ids,
    ).delete()[0]
    # Removed file count; storage app deprecated
    counts["users"] = demo_users.delete()[0]
    _AUCTION_REGISTRY.clear()
    return counts


def _seed_users(*, password: str) -> dict[str, User]:
    users: dict[str, User] = {}
    for spec in DEMO_USERS:
        user = User.objects.filter(email=spec.email).first()
        if user is None:
            user = create_user(
                email=spec.email,
                username=spec.username,
                full_name=spec.full_name,
                password=password,
                avatar_url=spec.avatar_url,
                bio=spec.bio,
                status=spec.status,
                is_staff=spec.is_staff,
                is_verified=True,
            )
        else:
            user.username = spec.username
            user.full_name = spec.full_name
            user.avatar_url = spec.avatar_url
            user.bio = spec.bio
            user.status = spec.status
            user.is_staff = spec.is_staff
            user.is_verified = True
            user.set_password(password)
            user.save()

        for role_name in spec.extra_roles:
            assign_role(user=user, role_name=role_name)

        users[spec.key] = user
    return users


def _attach_images(*, item: AuctionItem, uploader: User, image_urls: tuple[str, ...]) -> None:
    """Attach image URLs to an auction item.

    The new AuctionImage model stores a plain ``image_url`` string instead of a
    ``File`` foreign‑key. This helper now creates ``AuctionImage`` objects directly
    with the supplied URLs.
    """
    # Remove any existing images for the item to avoid duplicates on re‑seed.
    AuctionImage.objects.filter(item=item).delete()
    for index, image_url in enumerate(image_urls):
        AuctionImage.objects.create(
            item=item,
            image_url=image_url,
            is_primary=index == 0,
            sort_order=index,
        )


def _create_demo_auction(*, spec: DemoAuctionSpec, users: dict[str, User]) -> Auction:
    seller = users[spec.seller_key]
    category = AuctionCategory.objects.filter(slug=spec.category_slug).first()
    start_time = hours_from_now(spec.start_offset_hours)
    end_time = hours_from_now(spec.end_offset_hours)
    current_price = spec.bids[-1].amount if spec.bids else spec.starting_price

    item = AuctionItem.objects.create(
        seller=seller,
        title=spec.title,
        description=spec.description,
        category=category,
        category_label=spec.category_label,
        starting_price=spec.starting_price,
        current_price=current_price,
        minimum_increment=spec.minimum_increment,
        reserve_price=spec.reserve_price,
        buy_now_price=spec.buy_now_price,
        condition_type=spec.condition_type,
    )
    _attach_images(item=item, uploader=seller, image_urls=spec.image_urls)

    now = timezone.now()
    started_at = None
    ended_at = None
    if spec.status == AuctionStatus.LIVE:
        started_at = start_time if start_time <= now else now
    if spec.status == AuctionStatus.ENDED:
        started_at = start_time
        ended_at = end_time

    auction = Auction.objects.create(
        item=item,
        start_time=start_time,
        end_time=end_time,
        status=spec.status,
        started_at=started_at,
        ended_at=ended_at,
        reserve_met=bool(spec.reserve_price and current_price >= spec.reserve_price),
    )

    for bid_spec in spec.bids:
        bid = Bid.objects.create(
            auction=auction,
            bidder=users[bid_spec.bidder_key],
            amount=bid_spec.amount,
            ip_address="127.0.0.1",
        )
        if bid_spec.offset_hours:
            Bid.objects.filter(pk=bid.pk).update(created_at=hours_from_now(bid_spec.offset_hours))

    for watcher_key in spec.watchers:
        AuctionWatcher.objects.get_or_create(auction=auction, user=users[watcher_key])

    if spec.stream_title:
        stream_key = generate_stream_key()
        stream_started_at = (
            hours_from_now(spec.stream_started_offset_hours)
            if spec.stream_started_offset_hours is not None
            else None
        )
        LiveStream.objects.create(
            auction=auction,
            streamer=seller,
            stream_key=stream_key,
            stream_key_hash=_stream_key_hash(stream_key),
            title=spec.stream_title,
            description=spec.description[:255],
            status=LiveStreamStatus.LIVE if spec.stream_live else LiveStreamStatus.READY,
            is_live=spec.stream_live,
            viewer_count=spec.stream_viewer_count,
            started_at=stream_started_at,
        )

    _AUCTION_REGISTRY[spec.key] = auction
    return auction


def _seed_friendships(*, users: dict[str, User]) -> int:
    created = 0
    for requester_key, addressee_key in DEMO_FRIENDSHIPS:
        _, was_created = Friendship.objects.get_or_create(
            requester=users[requester_key],
            addressee=users[addressee_key],
            defaults={"status": FriendshipStatus.ACCEPTED},
        )
        if was_created:
            created += 1
    return created


def _seed_notifications(*, users: dict[str, User]) -> int:
    created = 0
    for spec in DEMO_NOTIFICATIONS:
        created_at = hours_from_now(spec.offset_hours)
        notification, was_created = Notification.objects.get_or_create(
            user=users[spec.user_key],
            type=spec.notification_type,
            title=spec.title,
            defaults={
                "content": spec.content,
                "is_read": spec.is_read,
            },
        )
        if was_created:
            created += 1
        Notification.objects.filter(pk=notification.pk).update(
            is_read=spec.is_read,
            created_at=created_at,
        )
    return created


def _seed_messages(*, users: dict[str, User]) -> int:
    created = 0
    for spec in DEMO_MESSAGES:
        auction = _AUCTION_REGISTRY.get(spec.auction_key)
        if auction is None:
            continue
        room, _ = ChatRoom.objects.get_or_create(
            auction=auction,
            defaults={"name": auction.item.title},
        )
        message, was_created = Message.objects.get_or_create(
            room=room,
            sender=users[spec.sender_key],
            message=spec.content,
        )
        if was_created:
            created += 1
        Message.objects.filter(pk=message.pk).update(created_at=hours_from_now(spec.offset_hours))
    return created


def _seed_reports(*, users: dict[str, User]) -> int:
    created = 0
    for spec in DEMO_REPORTS:
        auction = _AUCTION_REGISTRY.get(spec.auction_key)
        if auction is None:
            continue
        report, was_created = Report.objects.get_or_create(
            reporter=users[spec.reporter_key],
            target_type=ReportTargetType.AUCTION,
            target_id=auction.id,
            defaults={
                "reason": ReportReason.OTHER,
                "description": spec.description,
                "status": ReportStatus.OPEN,
            },
        )
        if was_created:
            created += 1
        Report.objects.filter(pk=report.pk).update(created_at=hours_from_now(spec.offset_hours))
    return created


def _seed_analytics(*, users: dict[str, User]) -> int:
    created = 0
    for spec in DEMO_ANALYTICS_EVENTS:
        event, was_created = AnalyticsEvent.objects.get_or_create(
            user=users[spec.user_key],
            event_type=spec.event_type,
            metadata=spec.metadata,
            defaults={"ip_address": "127.0.0.1"},
        )
        if was_created:
            created += 1
        AnalyticsEvent.objects.filter(pk=event.pk).update(created_at=hours_from_now(spec.offset_hours))
    return created


@transaction.atomic
def seed_demo_data(*, password: str) -> dict[str, int | dict[str, User]]:
    _AUCTION_REGISTRY.clear()
    users = _seed_users(password=password)
    auctions_created = 0
    for spec in DEMO_AUCTIONS:
        exists = AuctionItem.objects.filter(
            seller=users[spec.seller_key],
            title=spec.title,
        ).exists()
        if not exists:
            _create_demo_auction(spec=spec, users=users)
            auctions_created += 1
        else:
            auction = Auction.objects.filter(
                item__title=spec.title,
                item__seller=users[spec.seller_key],
            ).first()
            if auction:
                _AUCTION_REGISTRY[spec.key] = auction

    return {
        "users": len(users),
        "auctions": auctions_created,
        "friendships": _seed_friendships(users=users),
        "notifications": _seed_notifications(users=users),
        "messages": _seed_messages(users=users),
        "reports": _seed_reports(users=users),
        "analytics_events": _seed_analytics(users=users),
        "demo_users": users,
    }
