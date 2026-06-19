from rest_framework.routers import DefaultRouter

from apps.users.api.views import PermissionViewSet, RoleViewSet, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("roles", RoleViewSet, basename="roles")
router.register("permissions", PermissionViewSet, basename="permissions")

urlpatterns = router.urls
