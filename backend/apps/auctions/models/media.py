from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class AuctionWatcher(models.Model):
    auction = models.ForeignKey("auctions.Auction", on_delete=models.CASCADE, related_name="watchers")
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
    item = models.ForeignKey("auctions.AuctionItem", on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=1000)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "auction_images"
        verbose_name = "Auction Image"
        verbose_name_plural = "Auction Images"
        ordering = ["sort_order", "created_at"]
        indexes = [models.Index(fields=["item"], name="idx_auction_images_item")]
        constraints = [
            models.UniqueConstraint(fields=["item", "image_url"], name="uniq_auction_image"),
        ]


class AuctionAuditLog(TimeStampedModel):
    auction = models.ForeignKey("auctions.Auction", on_delete=models.CASCADE, related_name="audit_logs")
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
