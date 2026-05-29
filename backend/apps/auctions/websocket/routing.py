from django.urls import path

from apps.auctions.websocket.consumers import AuctionConsumer
from apps.auctions.websocket.stream_consumers import StreamConsumer

websocket_urlpatterns = [
    path("ws/auctions/<int:auction_id>/", AuctionConsumer.as_asgi()),
    path("ws/auctions/<int:auction_id>/streams/<int:stream_id>/", StreamConsumer.as_asgi()),
]
