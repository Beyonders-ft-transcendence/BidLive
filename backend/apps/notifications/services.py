from apps.auctions.models import Auction
from apps.auctions.models import AuctionWatcher
from apps.notifications.models import Notification, NotificationType


def notify_user(*, user, notification_type: str, title: str, content: str) -> Notification:
    return Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        content=content,
    )


def notify_auction_watchers(
    *,
    auction: Auction,
    notification_type: str,
    title: str,
    content: str,
    exclude_user_ids: list[int] | None = None,
) -> int:
    exclude_user_ids = exclude_user_ids or []
    watchers = (
        AuctionWatcher.objects.filter(auction=auction)
        .exclude(user_id__in=exclude_user_ids)
        .select_related("user")
    )
    notifications = [
        Notification(
            user=watcher.user,
            type=notification_type,
            title=title,
            content=content,
        )
        for watcher in watchers
    ]
    Notification.objects.bulk_create(notifications)
    return len(notifications)


def notify_outbid(*, user, auction: Auction) -> None:
    notify_user(
        user=user,
        notification_type=NotificationType.OUTBID,
        title="You have been outbid",
        content=f"Auction {auction.id} has a higher bid.",
    )
