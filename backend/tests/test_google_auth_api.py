from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIClient

from apps.access.models import OAuthAccount, OAuthProvider
from apps.analytics.models import AnalyticsEvent
from apps.users.models import User


GOOGLE_PROFILE = {
    "sub": "google-user-123",
    "email": "google.user@gmail.com",
    "email_verified": True,
    "name": "Google User",
    "picture": "https://lh3.googleusercontent.com/avatar.png",
    "given_name": "Google",
}


@pytest.fixture()
def google_settings(settings):
    settings.GOOGLE_CLIENT_ID = "test-client-id"
    settings.GOOGLE_CLIENT_SECRET = "test-client-secret"
    settings.GOOGLE_CALLBACK_URL = "http://localhost:3000/auth/google/callback"
    return settings


def _mock_google_userinfo_response():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = GOOGLE_PROFILE
    return mock_response


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.get", return_value=_mock_google_userinfo_response())
def test_google_login_creates_user_and_returns_jwt(mock_get, google_settings):
    client = APIClient()

    response = client.post(
        "/api/auth/google/",
        {"access_token": "google-access-token"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["success"] is True
    assert response.data["data"]["access_token"]
    assert response.data["data"]["refresh_token"]
    assert response.data["data"]["user"]["email"] == GOOGLE_PROFILE["email"]

    user = User.objects.get(email=GOOGLE_PROFILE["email"])
    assert user.is_verified is True
    assert user.avatar_url == GOOGLE_PROFILE["picture"]

    oauth = OAuthAccount.objects.get(user=user, provider=OAuthProvider.GOOGLE)
    assert oauth.provider_user_id == GOOGLE_PROFILE["sub"]

    assert AnalyticsEvent.objects.filter(user=user, event_type="auth.google_login_success").exists()
    mock_get.assert_called_once()


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.get", return_value=_mock_google_userinfo_response())
def test_google_login_links_existing_user_by_email(mock_get, google_settings, user):
    user.email = GOOGLE_PROFILE["email"]
    user.save(update_fields=["email"])

    client = APIClient()
    response = client.post(
        "/api/auth/google/",
        {"access_token": "google-access-token"},
        format="json",
    )

    assert response.status_code == 200
    assert OAuthAccount.objects.filter(user=user, provider=OAuthProvider.GOOGLE).exists()
    assert User.objects.filter(email=GOOGLE_PROFILE["email"]).count() == 1


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.post")
@patch("apps.users.oauth_service.requests.get", return_value=_mock_google_userinfo_response())
def test_google_callback_exchanges_code(mock_get, mock_post, google_settings):
    token_response = MagicMock()
    token_response.status_code = 200
    token_response.json.return_value = {"access_token": "exchanged-access-token"}
    mock_post.return_value = token_response

    client = APIClient()
    response = client.post(
        "/api/auth/google/callback/",
        {"code": "auth-code-123"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["data"]["access_token"]
    mock_post.assert_called_once()


@pytest.mark.django_db
def test_google_login_requires_token(google_settings):
    client = APIClient()
    response = client.post("/api/auth/google/", {}, format="json")
    assert response.status_code == 400
