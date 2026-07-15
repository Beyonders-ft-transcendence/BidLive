from unittest.mock import MagicMock, patch

import pytest
from rest_framework.test import APIClient

from apps.access.models import OAuthAccount, OAuthProvider, Session
from apps.analytics.models import AnalyticsEvent
from apps.users.models import User


FORTY_TWO_PROFILE = {
    "id": 4242,
    "email": "cadet@42luanda.ao",
    "login": "cadet42",
    "displayname": "Cadet Forty Two",
    "image": {"link": "https://cdn.intra.42.fr/users/cadet42.png"},
}


@pytest.fixture()
def forty_two_settings(settings):
    settings.FORTY_TWO_CLIENT_ID = "forty-two-client-id"
    settings.FORTY_TWO_CLIENT_SECRET = "forty-two-client-secret"
    settings.FORTY_TWO_REDIRECT_URI = "http://localhost:3000/auth/42/callback"
    settings.FORTY_TWO_SCOPES = "public"
    return settings


def _mock_42_token_response(access_token="forty-two-access-token", refresh_token="forty-two-refresh-token"):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }
    return mock_response


def _mock_42_profile_response():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = FORTY_TWO_PROFILE
    return mock_response


@pytest.mark.django_db
def test_42_authorize_returns_authorization_url(forty_two_settings):
    client = APIClient()

    response = client.get("/api/auth/42/")

    assert response.status_code == 200
    assert response.data["success"] is True
    assert "https://api.intra.42.fr/oauth/authorize?" in response.data["data"]["authorization_url"]
    assert "client_id=forty-two-client-id" in response.data["data"]["authorization_url"]
    assert "response_type=code" in response.data["data"]["authorization_url"]
    assert response.data["data"]["state"]


@pytest.mark.django_db
def test_42_callback_rejects_invalid_state(forty_two_settings):
    client = APIClient()

    response = client.post(
        "/api/auth/42/callback/",
        {"code": "auth-code-42", "state": "invalid-state"},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["success"] is False
    assert AnalyticsEvent.objects.filter(event_type="auth.42_login_failed").exists()


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.post")
def test_42_callback_returns_error_for_invalid_code(mock_post, forty_two_settings):
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_post.return_value = mock_response

    client = APIClient()
    authorize = client.get("/api/auth/42/")

    response = client.post(
        "/api/auth/42/callback/",
        {"code": "invalid-code", "state": authorize.data["data"]["state"]},
        format="json",
    )

    assert response.status_code == 400
    assert response.data["success"] is False
    assert AnalyticsEvent.objects.filter(event_type="auth.42_login_failed").exists()


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.get", return_value=_mock_42_profile_response())
@patch("apps.users.oauth_service.requests.post", return_value=_mock_42_token_response())
def test_42_callback_creates_user_returns_jwt_and_session(mock_post, mock_get, forty_two_settings):
    client = APIClient()
    authorize = client.get("/api/auth/42/")

    response = client.post(
        "/api/auth/42/callback/",
        {
            "code": "auth-code-42",
            "state": authorize.data["data"]["state"],
            "redirect_uri": forty_two_settings.FORTY_TWO_REDIRECT_URI,
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["success"] is True
    assert response.data["data"]["access_token"]
    assert response.data["data"]["refresh_token"]
    assert response.data["data"]["user"]["email"] == FORTY_TWO_PROFILE["email"]

    user = User.objects.get(email=FORTY_TWO_PROFILE["email"])
    assert user.is_verified is True
    assert user.avatar_url == FORTY_TWO_PROFILE["image"]["link"]

    oauth = OAuthAccount.objects.get(user=user, provider=OAuthProvider.FORTY_TWO)
    assert oauth.provider_user_id == str(FORTY_TWO_PROFILE["id"])
    assert Session.objects.filter(user=user, is_active=True).exists()
    assert AnalyticsEvent.objects.filter(user=user, event_type="auth.42_login_success").exists()
    assert AnalyticsEvent.objects.filter(user=user, event_type="auth.42_account_linked").exists()
    mock_post.assert_called_once()
    mock_get.assert_called_once()


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.get", return_value=_mock_42_profile_response())
@patch("apps.users.oauth_service.requests.post", return_value=_mock_42_token_response())
def test_42_callback_links_existing_user_by_email(mock_post, mock_get, forty_two_settings, user):
    user.email = FORTY_TWO_PROFILE["email"]
    user.save(update_fields=["email"])

    client = APIClient()
    authorize = client.get("/api/auth/42/")
    response = client.post(
        "/api/auth/42/callback/",
        {"code": "auth-code-42", "state": authorize.data["data"]["state"]},
        format="json",
    )

    assert response.status_code == 200
    assert OAuthAccount.objects.filter(user=user, provider=OAuthProvider.FORTY_TWO).exists()
    assert User.objects.filter(email=FORTY_TWO_PROFILE["email"]).count() == 1


@pytest.mark.django_db
@patch("apps.users.oauth_service.requests.get", return_value=_mock_42_profile_response())
@patch("apps.users.oauth_service.requests.post", return_value=_mock_42_token_response())
def test_42_callback_authenticates_existing_linked_user(mock_post, mock_get, forty_two_settings, user):
    user.email = FORTY_TWO_PROFILE["email"]
    user.save(update_fields=["email"])
    OAuthAccount.objects.create(
        user=user,
        provider=OAuthProvider.FORTY_TWO,
        provider_user_id=str(FORTY_TWO_PROFILE["id"]),
        access_token="old-token",
    )

    client = APIClient()
    authorize = client.get("/api/auth/42/")
    response = client.post(
        "/api/auth/42/callback/",
        {"code": "auth-code-42", "state": authorize.data["data"]["state"]},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["data"]["user"]["email"] == user.email
    assert User.objects.filter(email=user.email).count() == 1
