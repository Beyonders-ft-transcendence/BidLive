from django.urls import path

from apps.auctions.websocket.consumers import AuctionConsumer, GlobalAuctionConsumer

websocket_urlpatterns = [
    path("ws/auctions/global/", GlobalAuctionConsumer.as_asgi()),
    path("ws/auctions/<int:auction_id>/", AuctionConsumer.as_asgi()),
]
