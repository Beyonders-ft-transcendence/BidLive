from django.db import models


class DomainQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_archived=False)


class DomainManager(models.Manager):
    def get_queryset(self):
        return DomainQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()
