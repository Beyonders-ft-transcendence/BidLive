from django.db.models import Prefetch, QuerySet

from apps.auctions.models import Auction, AuctionImage, AuctionItem, AuctionStatus, Bid


def list_auctions() -> QuerySet[Auction]:
    return (
        Auction.objects.select_related(
            "item",
            "item__category",
            "winner",
            "buy_now_by",
            "cancelled_by",
        )
        .prefetch_related(
            Prefetch("item__images", queryset=AuctionImage.objects.select_related("file"))
        )
        .order_by("-start_time")
    )


def get_auction_by_id(*, auction_id: int) -> Auction:
    return list_auctions().get(pk=auction_id)


def get_auction_for_update(*, auction_id: int) -> Auction:
    return Auction.objects.select_for_update().select_related("item").get(pk=auction_id)


def get_auction_item_by_id(*, item_id: int) -> AuctionItem:
    return AuctionItem.objects.select_related("category", "seller").get(pk=item_id)


def list_bids_for_auction(*, auction_id: int) -> QuerySet[Bid]:
    return (
        Bid.objects.filter(auction_id=auction_id)
        .select_related("bidder")
        .order_by("-created_at", "-id")
    )


def get_highest_bid_for_auction(*, auction_id: int) -> Bid | None:
    return (
        Bid.objects.filter(auction_id=auction_id)
        .select_related("bidder")
        .order_by("-amount", "created_at", "id")
        .first()
    )


def live_auctions() -> QuerySet[Auction]:
    return Auction.objects.filter(status=AuctionStatus.LIVE)
