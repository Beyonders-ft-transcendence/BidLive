from rest_framework.routers import DefaultRouter

from apps.social.api.views import BlockViewSet, FriendshipViewSet

router = DefaultRouter()

router.register("social/friendships", FriendshipViewSet, basename="friendships")
router.register("social/users", BlockViewSet, basename="users")

urlpatterns = router.urls
