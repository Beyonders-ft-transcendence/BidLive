from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Bid(TimeStampedModel):
    auction = models.ForeignKey("auctions.Auction", on_delete=models.CASCADE, related_name="bids")
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_buy_now = models.BooleanField(default=False)

    class Meta:
        db_table = "bids"
        verbose_name = "Bid"
        verbose_name_plural = "Bids"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auction"], name="idx_bids_auction"),
            models.Index(fields=["bidder"], name="idx_bids_bidder"),
            models.Index(fields=["auction", "created_at"], name="idx_bids_auction_time"),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(amount__gt=0), name="check_bid_amount_gt_zero")
        ]

    def __str__(self) -> str:
        return f"Bid {self.id}"
