from django.db import models


class AuctionQuerySet(models.QuerySet):
    def live(self):
        return self.filter(status="LIVE")

    def scheduled(self):
        return self.filter(status="SCHEDULED")

