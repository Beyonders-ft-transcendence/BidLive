from django.urls import path

from apps.auctions.websocket.consumers import AuctionConsumer

websocket_urlpatterns = [
    path("ws/auctions/<int:auction_id>/", AuctionConsumer.as_asgi()),
]
