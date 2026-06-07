from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from apps.auctions.models import AuctionCategory


def list_categories(*, active_only: bool = False) -> QuerySet[AuctionCategory]:
    queryset = AuctionCategory.objects.all().order_by("sort_order", "name")
    if active_only:
        queryset = queryset.filter(is_active=True)
    return queryset


def get_category_by_id(*, category_id: int) -> AuctionCategory:
    return get_object_or_404(AuctionCategory, pk=category_id)
