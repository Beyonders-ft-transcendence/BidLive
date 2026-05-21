from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.domain.views import DomainViewSet
from apps.users.views import (
    ChangePasswordView,
    FortyTwoAuthorizeView,
    FortyTwoCallbackView,
    ForgotPasswordView,
    GoogleCallbackView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    RefreshView,
    RegisterView,
    ResetPasswordView,
    SwaggerOAuth2TokenView,
    UserMeView,
)

router = DefaultRouter()
router.register("domain", DomainViewSet, basename="domain")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/swagger-token/", SwaggerOAuth2TokenView.as_view(), name="auth-swagger-token"),
    path("auth/refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", UserMeView.as_view(), name="user_me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="auth-reset-password"),
    path("auth/google/", GoogleLoginView.as_view(), name="auth-google"),
    path("auth/google/callback/", GoogleCallbackView.as_view(), name="auth-google-callback"),
    path("auth/42/", FortyTwoAuthorizeView.as_view(), name="auth-42"),
    path("auth/42/callback/", FortyTwoCallbackView.as_view(), name="auth-42-callback"),
]

urlpatterns += router.urls
urlpatterns += [
    path("", include("apps.users.api.urls")),
	path("api/social/", include("apps.social.api.urls"))
]
