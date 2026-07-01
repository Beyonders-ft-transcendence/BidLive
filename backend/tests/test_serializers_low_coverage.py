import pytest

from apps.access.models import ApiKey, OAuthAccount, OAuthProvider, Session
from apps.access.serializers import ApiKeySerializer, OAuthAccountSerializer, SessionSerializer
from apps.analytics.models import AnalyticsEvent
from apps.analytics.serializers import AnalyticsEventSerializer
from apps.notifications.models import Notification, NotificationType
from apps.notifications.serializers import NotificationSerializer
from apps.reports.models import (
    Report,
    ReportAction,
    ReportActionType,
    ReportEvidence,
    ReportReason,
    ReportTargetType,
)
from apps.reports.serializers import (
    ReportActionSerializer,
    ReportEvidenceSerializer,
    ReportSerializer,
)
from apps.storage.models import File
from apps.storage.serializers import FileSerializer


@pytest.mark.django_db
def test_access_serializers_include_expected_fields(user):
    oauth = OAuthAccount.objects.create(
        user=user,
        provider=OAuthProvider.GOOGLE,
        provider_user_id="oauth-123",
    )
    api_key = ApiKey.objects.create(user=user, api_key="key-123", is_active=True)
    session = Session.objects.create(user=user, token="token-123", ip_address="127.0.0.1")

    oauth_data = OAuthAccountSerializer(oauth).data
    api_key_data = ApiKeySerializer(api_key).data
    session_data = SessionSerializer(session).data

    assert oauth_data["id"] == oauth.id
    assert oauth_data["user"] == user.id
    assert oauth_data["provider"] == OAuthProvider.GOOGLE
    assert "created_at" in oauth_data

    assert api_key_data["id"] == api_key.id
    assert api_key_data["user"] == user.id
    assert api_key_data["api_key"] == "key-123"
    assert api_key_data["is_active"] is True
    assert api_key_data["rate_limit_per_minute"] == 60

    assert session_data["id"] == session.id
    assert session_data["user"] == user.id
    assert session_data["token"] == "token-123"
    assert session_data["ip_address"] == "127.0.0.1"


@pytest.mark.django_db
def test_analytics_serializer_includes_expected_fields(user):
    event = AnalyticsEvent.objects.create(
        user=user,
        event_type="AUCTION_VIEW",
        metadata={"source": "home"},
        ip_address="10.0.0.5",
    )

    data = AnalyticsEventSerializer(event).data

    assert data["id"] == event.id
    assert data["user"] == user.id
    assert data["event_type"] == "AUCTION_VIEW"
    assert data["metadata"] == {"source": "home"}
    assert data["ip_address"] == "10.0.0.5"
    assert "created_at" in data


@pytest.mark.django_db
def test_notifications_serializer_includes_expected_fields(user):
    notification = Notification.objects.create(
        user=user,
        type=NotificationType.NEW_BID,
        title="New bid",
        content="Your item received a new bid.",
        is_read=False,
    )

    data = NotificationSerializer(notification).data

    assert data["id"] == notification.id
    assert data["user"] == user.id
    assert data["type"] == NotificationType.NEW_BID
    assert data["title"] == "New bid"
    assert data["content"] == "Your item received a new bid."
    assert data["is_read"] is False
    assert "created_at" in data


@pytest.mark.django_db
def test_storage_serializer_includes_expected_fields(user):
    file_obj = File.objects.create(
        uploader=user,
        file_name="stored.jpg",
        original_name="upload.jpg",
        mime_type="image/jpeg",
        size=1024,
        url="https://cdn.example.com/stored.jpg",
    )

    data = FileSerializer(file_obj).data

    assert data["id"] == file_obj.id
    assert data["uploader"] == user.id
    assert data["file_name"] == "stored.jpg"
    assert data["original_name"] == "upload.jpg"
    assert data["mime_type"] == "image/jpeg"
    assert data["size"] == 1024
    assert data["url"] == "https://cdn.example.com/stored.jpg"
    assert "created_at" in data


@pytest.mark.django_db
def test_reports_serializers_include_expected_fields(user):
    target_file = File.objects.create(
        uploader=user,
        file_name="evidence.png",
        original_name="evidence.png",
        mime_type="image/png",
        size=2048,
        url="https://cdn.example.com/evidence.png",
    )
    report = Report.objects.create(
        reporter=user,
        target_type=ReportTargetType.USER,
        target_id=123,
        reason=ReportReason.SPAM,
    )
    action = ReportAction.objects.create(
        report=report,
        admin=user,
        action=ReportActionType.COMMENT,
        note="Investigating",
    )
    evidence = ReportEvidence.objects.create(report=report, file=target_file)

    report_data = ReportSerializer(report).data
    action_data = ReportActionSerializer(action).data
    evidence_data = ReportEvidenceSerializer(evidence).data

    assert report_data["id"] == report.id
    assert report_data["reporter"]["id"] == user.id
    assert report_data["target_type"] == ReportTargetType.USER
    assert report_data["target_id"] == 123
    assert report_data["reason"] == ReportReason.SPAM
    assert report_data["status"] == report.status

    assert action_data["id"] == action.id
    assert action_data["admin"]["id"] == user.id
    assert action_data["action"] == ReportActionType.COMMENT
    assert action_data["note"] == "Investigating"

    assert evidence_data["id"] == evidence.id
    assert evidence_data["file"] == target_file.id
