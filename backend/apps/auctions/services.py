from decimal import Decimal

from django.db import transaction

from apps.auctions.models import Auction, Bid
from apps.users.models import User


@transaction.atomic
def place_bid(*, auction: Auction, bidder: User, amount: Decimal) -> Bid:
    bid = Bid.objects.create(auction=auction, bidder=bidder, amount=amount)
    auction.item.current_price = amount
    auction.item.save(update_fields=["current_price"])
    return bid
