from django.conf import settings
from django.db import models

from apps.auctions.managers import AuctionManager
from common.models import TimeStampedModel


class ItemCondition(models.TextChoices):
    NEW = "NEW", "New"
    USED = "USED", "Used"
    REFURBISHED = "REFURBISHED", "Refurbished"
    DAMAGED = "DAMAGED", "Damaged"


class AuctionStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    SCHEDULED = "SCHEDULED", "Scheduled"
    LIVE = "LIVE", "Live"
    ENDED = "ENDED", "Ended"
    CANCELLED = "CANCELLED", "Cancelled"
    SOLD = "SOLD", "Sold"


class AuctionItem(TimeStampedModel):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="auction_items"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        "auctions.AuctionCategory",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="items",
    )
    category_label = models.CharField(max_length=100, blank=True)
    starting_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    minimum_increment = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    buy_now_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    condition_type = models.CharField(
        max_length=20, choices=ItemCondition.choices, null=True, blank=True
    )

    class Meta:
        db_table = "auction_items"
        verbose_name = "Auction Item"
        verbose_name_plural = "Auction Items"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(starting_price__gte=0),
                name="check_item_starting_price_gte_zero",
            ),
            models.CheckConstraint(
                condition=models.Q(current_price__gte=models.F("starting_price")),
                name="check_item_current_price_gte_starting",
            ),
            models.CheckConstraint(
                condition=models.Q(minimum_increment__gt=0),
                name="check_item_min_increment_gt_zero",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(reserve_price__isnull=True)
                    | models.Q(reserve_price__gte=models.F("starting_price"))
                ),
                name="check_item_reserve_price_gte_starting",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(buy_now_price__isnull=True)
                    | models.Q(buy_now_price__gte=models.F("starting_price"))
                ),
                name="check_item_buy_now_price_gte_starting",
            ),
        ]

    def __str__(self) -> str:
        return self.title


class Auction(TimeStampedModel):
    item = models.ForeignKey(AuctionItem, on_delete=models.CASCADE, related_name="auctions")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=AuctionStatus.choices, default=AuctionStatus.DRAFT)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="won_auctions",
    )
    winning_bid = models.ForeignKey(
        "auctions.Bid",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="winning_auctions",
    )
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_auctions",
    )
    cancel_reason = models.CharField(max_length=255, blank=True)
    buy_now_at = models.DateTimeField(null=True, blank=True)
    buy_now_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="buy_now_auctions",
    )
    reserve_met = models.BooleanField(default=False)
    rules = models.JSONField(null=True, blank=True)

    objects = AuctionManager()

    class Meta:
        db_table = "auctions"
        verbose_name = "Auction"
        verbose_name_plural = "Auctions"
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["status"], name="idx_auctions_status"),
            models.Index(fields=["end_time"], name="idx_auctions_end_time"),
            models.Index(fields=["start_time"], name="idx_auctions_start_time"),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(end_time__gt=models.F("start_time")), name="check_auction_time")
        ]

    def __str__(self) -> str:
        return f"Auction {self.id}"
