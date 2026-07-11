from django.utils import timezone
from rest_framework import serializers


class LocalDateTimeField(serializers.DateTimeField):
    """
    DateTimeField that converts UTC datetimes to the local timezone
    (Africa/Luanda, UTC+1) defined in TIME_ZONE setting before
    serializing to the API response.
    """

    def to_representation(self, value):
        if value is not None and hasattr(value, "tzinfo") and value.tzinfo is not None:
            value = timezone.localtime(value)
        return super().to_representation(value)
