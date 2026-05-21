from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class LiveStream(TimeStampedModel):
    auction = models.ForeignKey("auctions.Auction", on_delete=models.CASCADE, related_name="streams")
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
