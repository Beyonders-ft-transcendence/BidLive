from django.conf import settings
from django.utils import timezone


def _is_eager() -> bool:
    return getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False)


def _ensure_aware(dt):
    """Guarantee a datetime is timezone-aware (UTC) before comparison or scheduling."""
    if dt is None:
        return dt
    if timezone.is_naive(dt):
        return dt.replace(tzinfo=timezone.utc)
    return dt


def schedule_auction_activation(*, auction_id: int, start_time) -> None:
    from apps.auctions.tasks.activate_auction import activate_auction_task

    start_time = _ensure_aware(start_time)
    now = timezone.now()
    if start_time <= now:
        activate_auction_task.delay(auction_id)
        return
    # In eager mode apply_async ignores eta and runs immediately,
    # so skip — the periodic beat task will activate it when due.
    if not _is_eager():
        activate_auction_task.apply_async(args=[auction_id], eta=start_time)


def schedule_auction_close(*, auction_id: int, end_time) -> None:
    from apps.auctions.tasks.close_auction import close_auction_task

    end_time = _ensure_aware(end_time)
    now = timezone.now()
    if end_time <= now:
        close_auction_task.delay(auction_id)
        return
    # In eager mode apply_async ignores eta and runs immediately,
    # so skip — the periodic beat task will close it when due.
    if not _is_eager():
        close_auction_task.apply_async(args=[auction_id], eta=end_time)
