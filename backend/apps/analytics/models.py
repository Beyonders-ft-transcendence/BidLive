from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class AnalyticsEvent(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    event_type = models.CharField(max_length=100)
    metadata = models.JSONField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, blank=True)

    class Meta:
        db_table = "analytics_events"
        verbose_name = "Analytics Event"
        verbose_name_plural = "Analytics Events"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["event_type"], name="idx_analytics_type")]
