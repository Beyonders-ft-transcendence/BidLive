from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


@receiver(post_save, sender=Notification)
def notification_created(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"user_{instance.user_id}_notifications"
            serializer = NotificationSerializer(instance)
            payload = serializer.data

            try:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "notification.message",
                        "notification": payload,
                    },
                )
            except Exception:
                # Silently handle errors to ensure database save operations don't fail
                pass
