from rest_framework import serializers

from apps.analytics.models import AnalyticsEvent
from common.fields import LocalizedModelSerializer


class AnalyticsEventSerializer(LocalizedModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ("id", "user", "event_type", "metadata", "ip_address", "created_at")
