from apps.analytics.models import AnalyticsEvent


def track_event(*, user, event_type: str, metadata: dict | None = None, ip_address: str = "") -> None:
    AnalyticsEvent.objects.create(
        user=user,
        event_type=event_type,
        metadata=metadata or {},
        ip_address=ip_address,
    )
