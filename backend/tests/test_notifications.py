from unittest.mock import MagicMock, patch

import pytest
from django.urls import reverse

from apps.notifications.models import Notification, NotificationType
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.tasks import create_friend_request_notification_task
from apps.social.models import Friendship, FriendshipStatus


@pytest.mark.django_db
class TestNotificationAPI:

    def test_list_notifications_requires_auth(self, api_client):
        url = reverse("notifications-list")
        res = api_client.get(url)
        assert res.status_code == 401

    def test_list_notifications_success(self, auth_client, user):
        # Create some notifications for user
        n1 = Notification.objects.create(
            user=user,
            type=NotificationType.MESSAGE,
            title="Title 1",
            content="Content 1",
        )
        n2 = Notification.objects.create(
            user=user,
            type=NotificationType.FRIEND_REQUEST,
            title="Title 2",
            content="Content 2",
        )

        url = reverse("notifications-list")
        res = auth_client.get(url)

        assert res.status_code == 200
        # Check standard results pagination structure
        assert "results" in res.data["data"]
        results = res.data["data"]["results"]
        assert len(results) == 2
        assert results[0]["id"] == n2.id  # Ordered by created_at desc
        assert results[1]["id"] == n1.id

    def test_mark_notification_as_read_requires_auth(self, api_client, user):
        n = Notification.objects.create(
            user=user,
            type=NotificationType.MESSAGE,
            title="Title",
            content="Content",
        )
        url = reverse("notifications-read", kwargs={"pk": n.id})
        res = api_client.patch(url)
        assert res.status_code == 401

    def test_mark_notification_as_read_success(self, auth_client, user):
        n = Notification.objects.create(
            user=user,
            type=NotificationType.MESSAGE,
            title="Title",
            content="Content",
            is_read=False,
        )
        url = reverse("notifications-read", kwargs={"pk": n.id})
        res = auth_client.patch(url)

        assert res.status_code == 200
        assert res.data["success"] is True
        assert res.data["data"]["is_read"] is True

        n.refresh_from_db()
        assert n.is_read is True

    def test_mark_notification_as_read_denied_for_another_user(self, auth_client, other_user):
        n = Notification.objects.create(
            user=other_user,
            type=NotificationType.MESSAGE,
            title="Title",
            content="Content",
            is_read=False,
        )
        url = reverse("notifications-read", kwargs={"pk": n.id})
        res = auth_client.patch(url)

        assert res.status_code == 404
        n.refresh_from_db()
        assert n.is_read is False


@pytest.mark.django_db
class TestNotificationSignalsAndTasks:

    def test_friend_request_triggers_celery_task_and_creates_notification(self, user, other_user):
        # Creating a Friendship with status=PENDING should trigger the signals and celery task synchronously (due to eager configuration)
        friendship = Friendship.objects.create(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.PENDING,
        )

        assert Notification.objects.filter(
            user=other_user,
            type=NotificationType.FRIEND_REQUEST,
        ).exists()

        notification = Notification.objects.get(
            user=other_user,
            type=NotificationType.FRIEND_REQUEST,
        )
        assert user.username in notification.content

    def test_non_pending_friendship_does_not_trigger_notification(self, user, other_user):
        Friendship.objects.create(
            requester=user,
            addressee=other_user,
            status=FriendshipStatus.ACCEPTED,
        )

        assert not Notification.objects.filter(
            user=other_user,
            type=NotificationType.FRIEND_REQUEST,
        ).exists()

    def test_websocket_broadcast_on_notification_creation(self, user):
        from unittest.mock import AsyncMock
        with patch("apps.notifications.signals.get_channel_layer") as mock_get_channel_layer:
            mock_channel_layer = MagicMock()
            mock_channel_layer.group_send = AsyncMock()
            mock_get_channel_layer.return_value = mock_channel_layer

            notification = Notification.objects.create(
                user=user,
                type=NotificationType.OUTBID,
                title="Outbid!",
                content="You were outbid.",
            )

            mock_channel_layer.group_send.assert_called_once()
            args, kwargs = mock_channel_layer.group_send.call_args
            group_name = args[0]
            event = args[1]

            assert group_name == f"user_{user.id}_notifications"
            assert event["type"] == "notification.message"
            assert event["notification"]["id"] == notification.id
            assert event["notification"]["title"] == "Outbid!"
