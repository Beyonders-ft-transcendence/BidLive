from celery import shared_task
from django.contrib.auth import get_user_model
from apps.analytics.models import AnalyticsEvent

User = get_user_model()


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def save_analytics_event_task(self, user_id: int | None, event_type: str, metadata: dict | None = None, ip_address: str = "") -> None:
    user = None
    if user_id:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            pass

    AnalyticsEvent.objects.create(
        user=user,
        event_type=event_type,
        metadata=metadata or {},
        ip_address=ip_address,
    )
