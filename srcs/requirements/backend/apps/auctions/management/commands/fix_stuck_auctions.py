from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.auctions.models import Auction, AuctionStatus
from apps.auctions.services.auction_service import activate_auction, close_auction


class Command(BaseCommand):
    help = "Activate or close auctions stuck in SCHEDULED/ACTIVE status past their time."

    def handle(self, *args, **options):
        now = timezone.now()

        stuck_scheduled = Auction.objects.filter(
            status=AuctionStatus.SCHEDULED,
            start_time__lte=now,
        )
        activated = 0
        for auction in stuck_scheduled:
            activate_auction(auction=auction)
            activated += 1
            self.stdout.write(f"  Activated auction #{auction.id} (start_time={auction.start_time})")

        stuck_active = Auction.objects.filter(
            status__in=[AuctionStatus.ACTIVE, AuctionStatus.LIVE],
            end_time__lte=now,
        )
        closed = 0
        for auction in stuck_active:
            close_auction(auction=auction)
            closed += 1
            self.stdout.write(f"  Closed auction #{auction.id} (end_time={auction.end_time})")

        self.stdout.write(self.style.SUCCESS(
            f"Done: {activated} activated, {closed} closed."
        ))
