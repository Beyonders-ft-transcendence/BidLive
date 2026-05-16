from django.urls import path
from rest_framework.routers import DefaultRouter

from api.health import health_check
from apps.domain.views import ProjectViewSet
from core.users.views import (
    ChangePasswordView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RefreshView,
    RegisterView,
    ResetPasswordView,
    SwaggerOAuth2TokenView,
    UserMeView,
)

router = DefaultRouter()
router.register("domain", ProjectViewSet, basename="domain")

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/swagger-token/", SwaggerOAuth2TokenView.as_view(), name="auth-swagger-token"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", UserMeView.as_view(), name="user_me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
]

urlpatterns += router.urls
