from apps.domain import tasks
from apps.domain.models import Domain


def create_domain(*, owner, data: dict) -> Domain:
    project = Domain.objects.create(owner=owner, **data)
    tasks.notify_domain_created.delay(project.id)
    return project


def update_domain(*, project: Domain, data: dict) -> Domain:
    for field, value in data.items():
        setattr(project, field, value)
    project.save(update_fields=list(data.keys()))
    return project
