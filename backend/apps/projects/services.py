from apps.projects import tasks
from apps.projects.models import Project


def create_project(*, owner, data: dict) -> Project:
    project = Project.objects.create(owner=owner, **data)
    tasks.notify_project_created.delay(project.id)
    return project


def update_project(*, project: Project, data: dict) -> Project:
    for field, value in data.items():
        setattr(project, field, value)
    project.save(update_fields=list(data.keys()))
    return project
