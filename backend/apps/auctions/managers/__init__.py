from django.db import models

class AuctionQuerySet(models.QuerySet):
    def live(self):
        return self.filter(status="LIVE")

    def scheduled(self):
        return self.filter(status="SCHEDULED")

    def active(self):
        return self.filter(status__in=["SCHEDULED", "LIVE"])


class AuctionManager(models.Manager):
    def get_queryset(self):
        return AuctionQuerySet(self.model, using=self._db)

    def live(self):
        return self.get_queryset().live()

    def scheduled(self):
        return self.get_queryset().scheduled()

    def active(self):
        return self.get_queryset().active()
