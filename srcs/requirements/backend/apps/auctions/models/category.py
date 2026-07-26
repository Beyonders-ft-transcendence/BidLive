from django.db import models

from common.models import TimeStampedModel


class AuctionCategory(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "auction_categories"
        verbose_name = "Auction Category"
        verbose_name_plural = "Auction Categories"
        ordering = ["sort_order", "name"]
        indexes = [models.Index(fields=["slug"], name="idx_auction_category_slug")]

    def __str__(self) -> str:
        return self.name
