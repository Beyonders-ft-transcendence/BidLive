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
    Input field: treats every incoming datetime string as LOCAL time
    (Africa/Luanda, UTC+1), regardless of offset suffix.

    Swagger sends ``"2026-07-12T11:26:48.228Z"`` (UTC) when the user
    types 11:26 expecting local time.  This field strips the UTC offset
    and re-attaches the local timezone so Django stores the correct UTC
    equivalent (10:26 UTC → stored as 10:26 UTC → returned as 11:26+0100).
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("format", "%Y-%m-%dT%H:%M:%S.%f%z")
        super().__init__(*args, **kwargs)

    def to_internal_value(self, value):
        parsed = super().to_internal_value(value)
        if parsed is None:
            return parsed

        local_tz = _local_tz()

        # Naive → assume local timezone
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=local_tz)

        # UTC (Z, +00:00, etc.) → user meant local time, re-interpret
        utc_offset = parsed.utcoffset()
        if utc_offset is not None and utc_offset.total_seconds() == 0:
            return parsed.replace(tzinfo=None).replace(tzinfo=local_tz)

        # Already in local or another timezone → keep as-is
        return parsed

    def to_representation(self, value):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=dt_timezone.utc)
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
