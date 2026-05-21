from apps.auctions.models import Auction, Bid


def determine_winner(*, auction: Auction) -> tuple[int | None, Bid | None, bool]:
    winning_bid = (
        Bid.objects.filter(auction=auction)
        .order_by("-amount", "created_at")
        .select_related("bidder")
        .first()
    )
    if not winning_bid:
        return None, None, False

    reserve_price = auction.item.reserve_price
    reserve_met = reserve_price is None or winning_bid.amount >= reserve_price
    if not reserve_met:
        return None, None, False

    return winning_bid.bidder_id, winning_bid, True
