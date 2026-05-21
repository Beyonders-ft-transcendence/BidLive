from django.conf import settings
from django.db import models

from common.models import TimeStampedModel
from apps.auctions.managers import AuctionManager


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


class AuctionCategory(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "auction_categories"
        verbose_name = "Auction Category"
        verbose_name_plural = "Auction Categories"
        ordering = ["sort_order", "name"]
        indexes = [models.Index(fields=["slug"], name="idx_auction_category_slug")]

    def __str__(self) -> str:
        return self.name


class AuctionItem(TimeStampedModel):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="auction_items"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        AuctionCategory,
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
        "Bid",
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


class Bid(TimeStampedModel):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
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


class AuctionImage(TimeStampedModel):
    item = models.ForeignKey(AuctionItem, on_delete=models.CASCADE, related_name="images")
    file = models.ForeignKey("storage.File", on_delete=models.CASCADE, related_name="auction_images")
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "auction_images"
        verbose_name = "Auction Image"
        verbose_name_plural = "Auction Images"
        ordering = ["sort_order", "created_at"]
        indexes = [models.Index(fields=["item"], name="idx_auction_images_item")]
        constraints = [
            models.UniqueConstraint(fields=["item", "file"], name="uniq_auction_image"),
        ]


class AuctionAuditLog(TimeStampedModel):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="audit_logs")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="auction_audit_logs",
    )
    action = models.CharField(max_length=100)
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "auction_audit_logs"
        verbose_name = "Auction Audit Log"
        verbose_name_plural = "Auction Audit Logs"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["action"], name="idx_auction_audit_action")]


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
