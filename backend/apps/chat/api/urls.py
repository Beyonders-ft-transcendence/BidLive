from rest_framework.routers import DefaultRouter

from apps.chat.api.views import AuctionChatViewSet, PrivateConversationViewSet

router = DefaultRouter()
router.register("chat/conversations", PrivateConversationViewSet, basename="chat-conversations")
router.register("chat/auctions", AuctionChatViewSet, basename="chat-auctions")

urlpatterns = router.urls
