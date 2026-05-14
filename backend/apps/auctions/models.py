from django.conf import settings
from django.db import models

from common.models import TimeStampedModel
from apps.auctions.managers import AuctionManager


class ItemCondition(models.TextChoices):
    NEW = "NEW", "New"
    USED = "USED", "Used"
    REFURBISHED = "REFURBISHED", "Refurbished"


class AuctionStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Scheduled"
    LIVE = "LIVE", "Live"
    ENDED = "ENDED", "Ended"
    CANCELLED = "CANCELLED", "Cancelled"


class AuctionItem(TimeStampedModel):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="auction_items"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    starting_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    buy_now_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    image_url = models.URLField(blank=True)
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
                condition=models.Q(current_price__gte=models.F("starting_price")),
                name="check_item_current_price_gte_starting",
            )
        ]

    def __str__(self) -> str:
        return self.title


class Auction(TimeStampedModel):
    item = models.ForeignKey(AuctionItem, on_delete=models.CASCADE, related_name="auctions")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=AuctionStatus.choices, default=AuctionStatus.SCHEDULED)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="won_auctions",
    )

    objects = AuctionManager()

    class Meta:
        db_table = "auctions"
        verbose_name = "Auction"
        verbose_name_plural = "Auctions"
        ordering = ["-start_time"]
        indexes = [
            models.Index(fields=["status"], name="idx_auctions_status"),
            models.Index(fields=["end_time"], name="idx_auctions_end_time"),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(end_time__gt=models.F("start_time")), name="check_auction_time")
        ]

    def __str__(self) -> str:
        return f"Auction {self.id}"


class Bid(TimeStampedModel):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
    bidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "bids"
        verbose_name = "Bid"
        verbose_name_plural = "Bids"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auction"], name="idx_bids_auction"),
            models.Index(fields=["bidder"], name="idx_bids_bidder"),
        ]
        constraints = [
            models.CheckConstraint(condition=models.Q(amount__gt=0), name="check_bid_amount_gt_zero")
        ]

    def __str__(self) -> str:
        return f"Bid {self.id}"


class AuctionWatcher(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="watchers")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="auction_watches")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "auction_watchers"
        verbose_name = "Auction Watcher"
        verbose_name_plural = "Auction Watchers"
        constraints = [
            models.UniqueConstraint(fields=["auction", "user"], name="uniq_auction_watcher"),
        ]


class LiveStream(TimeStampedModel):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="streams")
    streamer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="streams")
    stream_key = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255, blank=True)
    is_live = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "live_streams"
        verbose_name = "Live Stream"
        verbose_name_plural = "Live Streams"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.stream_key


class StreamViewer(models.Model):
    stream = models.ForeignKey(LiveStream, on_delete=models.CASCADE, related_name="viewers")
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stream_views")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "stream_viewers"
        verbose_name = "Stream Viewer"
        verbose_name_plural = "Stream Viewers"
        constraints = [
            models.UniqueConstraint(fields=["stream", "viewer"], name="uniq_stream_viewer"),
        ]
