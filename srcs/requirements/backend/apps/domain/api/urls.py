from rest_framework.routers import DefaultRouter

from apps.domain.api.views import DomainViewSet

router = DefaultRouter()
router.register("domain", DomainViewSet, basename="domain")

urlpatterns = router.urls
