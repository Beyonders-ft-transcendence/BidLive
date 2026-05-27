from decimal import Decimal

from rest_framework.exceptions import ValidationError

from apps.auctions.models import Auction


def get_minimum_next_bid(*, auction: Auction) -> Decimal:
    increment = auction.item.minimum_increment or Decimal("0")
    return auction.item.current_price + increment


def ensure_bid_is_valid(*, auction: Auction, amount: Decimal) -> None:
    minimum_bid = get_minimum_next_bid(auction=auction)
    if amount < minimum_bid:
        raise ValidationError({"amount": [f"Bid must be >= {minimum_bid}."]})
    if auction.item.buy_now_price is not None and amount >= auction.item.buy_now_price:
        raise ValidationError({"amount": ["Use buy now for this amount."]})
