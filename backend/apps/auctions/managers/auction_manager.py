from django.db import models

from apps.auctions.managers.querysets import AuctionQuerySet


class AuctionManager(models.Manager):
    def get_queryset(self):
        return AuctionQuerySet(self.model, using=self._db)

    def live(self):
        return self.get_queryset().live()

    def scheduled(self):
        return self.get_queryset().scheduled()

