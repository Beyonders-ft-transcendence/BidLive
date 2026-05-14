from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class NotificationType(models.TextChoices):
    NEW_BID = "NEW_BID", "New Bid"
    OUTBID = "OUTBID", "Outbid"
    MESSAGE = "MESSAGE", "Message"
    FRIEND_REQUEST = "FRIEND_REQUEST", "Friend Request"
    STREAM_STARTED = "STREAM_STARTED", "Stream Started"
    AUCTION_ENDED = "AUCTION_ENDED", "Auction Ended"


class Notification(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = "notifications"
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user"], name="idx_notifications_user")]
