from celery import shared_task

from apps.domain.models import Domain


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def notify_domain_created(self, domain_id: int) -> None:
    Domain.objects.filter(id=domain_id).update(status="active")


@shared_task
def sample_heartbeat() -> str:
    return "ok"
