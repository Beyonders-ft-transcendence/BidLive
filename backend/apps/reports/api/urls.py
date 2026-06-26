from rest_framework.routers import DefaultRouter

from apps.reports.api.views import ReportViewSet

router = DefaultRouter()
router.register("reports", ReportViewSet, basename="reports")

urlpatterns = router.urls
