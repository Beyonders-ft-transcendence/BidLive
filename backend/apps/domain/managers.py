from django.db import models


class ProjectQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_archived=False)


class ProjectManager(models.Manager):
    def get_queryset(self):
        return ProjectQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()
