from rest_framework.routers import DefaultRouter

from apps.auctions.api.views.auction_views import AuctionViewSet
from apps.auctions.api.views.category_views import AuctionCategoryViewSet


def build_router() -> DefaultRouter:
    router = DefaultRouter()
    router.register("auctions", AuctionViewSet, basename="auctions")
    router.register("categories", AuctionCategoryViewSet, basename="auction-categories")
    return router
