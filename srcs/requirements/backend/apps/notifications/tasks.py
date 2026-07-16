from celery import shared_task
from django.contrib.auth import get_user_model

from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user

User = get_user_model()


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def create_friend_request_notification_task(self, requester_id: int, addressee_id: int) -> None:
    try:
        requester = User.objects.get(pk=requester_id)
        addressee = User.objects.get(pk=addressee_id)
    except User.DoesNotExist:
        return

    notify_user(
        user=addressee,
        notification_type=NotificationType.FRIEND_REQUEST,
        title="Novo pedido de amizade",
        content=f"{requester.username} enviou-te um pedido de amizade.",
    )
