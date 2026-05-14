from django.db.models import QuerySet

from apps.auctions.models import Auction, AuctionStatus


def live_auctions() -> QuerySet[Auction]:
    return Auction.objects.filter(status=AuctionStatus.LIVE)
