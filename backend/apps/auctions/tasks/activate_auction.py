from celery import shared_task

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def activate_auction_task(self, auction_id: int) -> None:
    from apps.auctions.services.auction_service import activate_auction_by_id

    activate_auction_by_id(auction_id=auction_id)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def activate_scheduled_auctions(self) -> int:
    from django.utils import timezone

    from apps.auctions.models import Auction, AuctionStatus
    from apps.auctions.services.auction_service import activate_auction_by_id

    now = timezone.now()
    auctions = Auction.objects.filter(status=AuctionStatus.SCHEDULED, start_time__lte=now)
    count = 0
    for auction in auctions:
        activate_auction_by_id(auction_id=auction.id)
        count += 1
    return count
