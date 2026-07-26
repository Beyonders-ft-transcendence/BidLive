from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class LiveStreamStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    READY = "READY", "Ready"
    LIVE = "LIVE", "Live"
    ENDED = "ENDED", "Ended"
    CANCELLED = "CANCELLED", "Cancelled"


class LiveStreamVisibility(models.TextChoices):
    PUBLIC = "PUBLIC", "Public"
    UNLISTED = "UNLISTED", "Unlisted"


class LiveStream(TimeStampedModel):
    auction = models.ForeignKey("auctions.Auction", on_delete=models.CASCADE, related_name="streams")
    streamer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="streams")
    stream_key = models.CharField(max_length=255, unique=True)
    stream_key_hash = models.CharField(max_length=128, blank=True)
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    thumbnail = models.ForeignKey(
        "storage.File",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stream_thumbnails",
    )
    status = models.CharField(max_length=20, choices=LiveStreamStatus.choices, default=LiveStreamStatus.DRAFT)
    visibility = models.CharField(
        max_length=20,
        choices=LiveStreamVisibility.choices,
        default=LiveStreamVisibility.PUBLIC,
    )
    is_live = models.BooleanField(default=False)
    viewer_count = models.PositiveIntegerField(default=0)
    stream_meta = models.JSONField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "live_streams"
        verbose_name = "Live Stream"
        verbose_name_plural = "Live Streams"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auction"], name="idx_streams_auction"),
            models.Index(fields=["status"], name="idx_streams_status"),
            models.Index(fields=["is_live"], name="idx_streams_live"),
        ]

    def __str__(self) -> str:
        return self.stream_key


class StreamViewer(models.Model):
    stream = models.ForeignKey(LiveStream, on_delete=models.CASCADE, related_name="viewers")
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="stream_views")
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stream_viewers"
        verbose_name = "Stream Viewer"
        verbose_name_plural = "Stream Viewers"
        constraints = [
            models.UniqueConstraint(fields=["stream", "viewer"], name="uniq_stream_viewer"),
        ]
