from django.urls import path

from apps.auctions.api.urls.router import build_router
from apps.auctions.api.views.stream_views import StreamViewSet

router = build_router()

stream_list = StreamViewSet.as_view({"get": "list", "post": "create"})
stream_detail = StreamViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"})
stream_start = StreamViewSet.as_view({"post": "start"})
stream_end = StreamViewSet.as_view({"post": "end"})
stream_regenerate_key = StreamViewSet.as_view({"post": "regenerate_key"})
stream_viewers = StreamViewSet.as_view({"get": "viewers"})

urlpatterns = router.urls + [
    path("auctions/<int:auction_id>/streams/", stream_list, name="auction-stream-list"),
    path("auctions/<int:auction_id>/streams/<int:pk>/", stream_detail, name="auction-stream-detail"),
    path("auctions/<int:auction_id>/streams/<int:pk>/start/", stream_start, name="auction-stream-start"),
    path("auctions/<int:auction_id>/streams/<int:pk>/end/", stream_end, name="auction-stream-end"),
    path(
        "auctions/<int:auction_id>/streams/<int:pk>/regenerate-key/",
        stream_regenerate_key,
        name="auction-stream-regenerate-key",
    ),
    path("auctions/<int:auction_id>/streams/<int:pk>/viewers/", stream_viewers, name="auction-stream-viewers"),
]

__all__ = ["router", "urlpatterns", "build_router"]
