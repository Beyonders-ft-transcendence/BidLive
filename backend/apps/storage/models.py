from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class File(TimeStampedModel):
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files")
    file_name = models.CharField(max_length=255, blank=True)
    original_name = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    size = models.BigIntegerField(null=True, blank=True)
    url = models.URLField(blank=True)

    class Meta:
        db_table = "files"
        verbose_name = "File"
        verbose_name_plural = "Files"
        ordering = ["-created_at"]
