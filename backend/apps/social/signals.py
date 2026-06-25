from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.notifications.tasks import create_friend_request_notification_task
from apps.social.models import Friendship, FriendshipStatus


@receiver(post_save, sender=Friendship)
def friendship_created(sender, instance, created, **kwargs):
    if created and instance.status == FriendshipStatus.PENDING:
        create_friend_request_notification_task.delay(
            requester_id=instance.requester_id,
            addressee_id=instance.addressee_id,
        )
