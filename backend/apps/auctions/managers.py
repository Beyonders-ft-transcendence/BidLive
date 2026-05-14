from django.db import models


class AuctionQuerySet(models.QuerySet):
    def live(self):
        return self.filter(status="LIVE")


class AuctionManager(models.Manager):
    def get_queryset(self):
        return AuctionQuerySet(self.model, using=self._db)

    def live(self):
        return self.get_queryset().live()
