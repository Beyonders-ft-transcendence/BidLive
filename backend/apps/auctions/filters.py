import django_filters

from apps.auctions.models import Auction


class AuctionFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    seller_id = django_filters.NumberFilter(field_name="item__seller_id")
    category_id = django_filters.NumberFilter(field_name="item__category_id")
    min_price = django_filters.NumberFilter(field_name="item__current_price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="item__current_price", lookup_expr="lte")
    starts_after = django_filters.IsoDateTimeFilter(field_name="start_time", lookup_expr="gte")
    ends_before = django_filters.IsoDateTimeFilter(field_name="end_time", lookup_expr="lte")

    class Meta:
        model = Auction
        fields = ["status", "seller_id", "category_id"]
