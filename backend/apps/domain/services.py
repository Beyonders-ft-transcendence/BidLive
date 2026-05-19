from apps.domain import tasks
from apps.domain.models import Domain


def create_domain(*, owner, data: dict) -> Domain:
    domain = Domain.objects.create(owner=owner, **data)
    tasks.notify_domain_created.delay(domain.id)
    return domain


def update_domain(*, domain: Domain, data: dict) -> Domain:
    for field, value in data.items():
        setattr(domain, field, value)
    domain.save(update_fields=list(data.keys()))
    return domain
