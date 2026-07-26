from celery import shared_task

from apps.notifications.models import NotificationType
from apps.notifications.services import notify_auction_watchers


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def notify_auction_watchers_task(self, auction_id: int, title: str, content: str) -> None:
    from apps.auctions.models import Auction

    auction = Auction.objects.get(pk=auction_id)
    notify_auction_watchers(
        auction=auction,
        notification_type=NotificationType.AUCTION_ENDED,
        title=title,
        content=content,
    )
