from datetime import timezone as dt_timezone
from zoneinfo import ZoneInfo

from django.conf import settings
from django.db import models as django_models
from django.utils import timezone
from rest_framework import serializers


def _local_tz():
    return ZoneInfo(settings.TIME_ZONE)


class LocalDateTimeField(serializers.DateTimeField):
    """
    Input field: accepts datetime strings in the configured local timezone
    (Africa/Luanda, UTC+1) and converts to UTC for storage.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("format", "%Y-%m-%dT%H:%M:%S.%f%z")
        super().__init__(*args, **kwargs)

    def to_representation(self, value):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=_local_tz())
            value = timezone.localtime(value, _local_tz())
        return super().to_representation(value)


class LocalDateTimeOutputField(serializers.DateTimeField):
    """
    Output-only field: converts UTC datetimes from the database to the
    configured timezone (Africa/Luanda, UTC+1) before serializing.

    Use this for EVERY DateTimeField that appears in API responses to avoid
    the UTC-vs-local offset bug (e.g. Swagger showing -1h).
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("format", "%Y-%m-%dT%H:%M:%S.%f%z")
        super().__init__(*args, **kwargs)

    def to_representation(self, value):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=dt_timezone.utc)
            value = timezone.localtime(value, _local_tz())
        return super().to_representation(value)


class LocalizedModelSerializer(serializers.ModelSerializer):
    """
    ModelSerializer that automatically maps every model DateTimeField to
    LocalDateTimeOutputField on output.  This eliminates the -1 h Swagger
    offset without requiring explicit field declarations in each serializer.

    Usage:
        class MySerializer(LocalizedModelSerializer):
            class Meta:
                model = MyModel
                fields = "__all__"
    """

    serializer_field_mapping = {
        **serializers.ModelSerializer.serializer_field_mapping,
        django_models.DateTimeField: LocalDateTimeOutputField,
    }
