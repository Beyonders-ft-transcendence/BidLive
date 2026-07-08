from celery import shared_task

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def close_auction_task(self, auction_id: int) -> None:
    from apps.auctions.services.auction_service import close_auction_by_id

    close_auction_by_id(auction_id=auction_id)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def close_expired_auctions(self) -> int:
    from django.utils import timezone

    from apps.auctions.models import Auction, AuctionStatus
    from apps.auctions.services.auction_service import close_auction_by_id

    now = timezone.now()
    auctions = Auction.objects.filter(status__in=[AuctionStatus.LIVE, AuctionStatus.ACTIVE], end_time__lte=now)
    count = 0
    for auction in auctions:
        close_auction_by_id(auction_id=auction.id)
        count += 1
    return count
