from django.db.models import QuerySet

from apps.auctions.models import AuctionCategory


def list_categories() -> QuerySet[AuctionCategory]:
    return AuctionCategory.objects.filter(is_active=True).order_by("sort_order", "name")
