from django.urls import path
 
from apps.chat.websocket.consumers import AuctionChatConsumer, PrivateChatConsumer
 
websocket_urlpatterns = [
    path("ws/chat/private/<int:recipient_id>/", PrivateChatConsumer.as_asgi()),
 
    path("ws/chat/auction/<int:auction_id>/", AuctionChatConsumer.as_asgi()),
]
 