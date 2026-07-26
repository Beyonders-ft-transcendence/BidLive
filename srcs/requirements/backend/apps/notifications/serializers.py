from rest_framework import serializers

from apps.notifications.models import Notification
from common.fields import LocalizedModelSerializer


class NotificationSerializer(LocalizedModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "user", "type", "title", "content", "is_read", "created_at")
