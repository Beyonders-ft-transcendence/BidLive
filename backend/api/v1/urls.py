from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.v1.health import health_check
from apps.projects.views import ProjectViewSet
from core.users.views import UserMeView

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", UserMeView.as_view(), name="user_me"),
]

urlpatterns += router.urls
