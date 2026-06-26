import pytest
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User, Permission, Role, UserRole, PermissionAuditLog
from apps.users.constants import ROLE_USER
from apps.auctions.models import AuctionItem, Auction, Bid
from apps.chat.models import Message, PrivateConversation, PrivateMessage
from apps.social.models import Friendship
from apps.notifications.models import Notification
from apps.analytics.models import AnalyticsEvent
from apps.reports.models import Report, ReportTargetType, ReportReason

@pytest.fixture()
def admin_user(db):
    user = User.objects.create_user(
        email="admin.user@example.com",
        username="admin_user",
        full_name="Admin User",
        password="password123",
    )
    role, _ = Role.objects.get_or_create(name="SUPER_ADMIN")
    perm, _ = Permission.objects.get_or_create(name="user.delete")
    role.permissions.add(perm)
    UserRole.objects.create(user=user, role=role)
    return user

@pytest.fixture()
def target_user(db):
    return User.objects.create_user(
        email="target.user@example.com",
        username="target_user",
        full_name="Target User",
        password="password123",
    )

@pytest.mark.django_db
def test_hard_delete_user_requires_permissions(target_user):
    regular_user = User.objects.create_user(
        email="regular.user@example.com",
        username="regular_user",
        full_name="Regular User",
        password="password123",
    )
    client = APIClient()
    client.force_authenticate(user=regular_user)

    response = client.delete(f"/api/users/{target_user.id}/hard-delete/")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=target_user.id).exists()

@pytest.mark.django_db
def test_hard_delete_user_cannot_delete_self(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.delete(f"/api/users/{admin_user.id}/hard-delete/")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert User.objects.filter(id=admin_user.id).exists()

@pytest.mark.django_db
def test_hard_delete_user_hierarchy_rules(db):
    # Setup users with different roles
    super_admin = User.objects.create_user(
        email="super@example.com", username="super_user", password="password123"
    )
    role_super, _ = Role.objects.get_or_create(name="SUPER_ADMIN")
    perm, _ = Permission.objects.get_or_create(name="user.delete")
    role_super.permissions.add(perm)
    UserRole.objects.create(user=super_admin, role=role_super)

    other_super = User.objects.create_user(
        email="super2@example.com", username="super_user2", password="password123"
    )
    UserRole.objects.create(user=other_super, role=role_super)

    monitor = User.objects.create_user(
        email="monitor@example.com", username="monitor_user", password="password123"
    )
    role_monitor, _ = Role.objects.get_or_create(name="MONITOR")
    role_monitor.permissions.add(perm)
    UserRole.objects.create(user=monitor, role=role_monitor)

    regular_user = User.objects.create_user(
        email="user@example.com", username="regular_user", password="password123"
    )
    role_user, _ = Role.objects.get_or_create(name="USER")
    UserRole.objects.create(user=regular_user, role=role_user)

    client = APIClient()

    # 1. MONITOR attempts to delete USER (allowed: 3 > 2)
    client.force_authenticate(user=monitor)
    response = client.delete(f"/api/users/{regular_user.id}/hard-delete/")
    assert response.status_code == status.HTTP_200_OK
    assert not User.objects.filter(id=regular_user.id).exists()

    # 2. MONITOR attempts to delete SUPER_ADMIN (forbidden: 3 <= 4)
    response = client.delete(f"/api/users/{super_admin.id}/hard-delete/")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=super_admin.id).exists()

    # 3. SUPER_ADMIN attempts to delete MONITOR (allowed: 4 > 3)
    client.force_authenticate(user=super_admin)
    response = client.delete(f"/api/users/{monitor.id}/hard-delete/")
    assert response.status_code == status.HTTP_200_OK
    assert not User.objects.filter(id=monitor.id).exists()

    # 4. SUPER_ADMIN attempts to delete another SUPER_ADMIN (forbidden: 4 <= 4)
    response = client.delete(f"/api/users/{other_super.id}/hard-delete/")
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=other_super.id).exists()

@pytest.mark.django_db
def test_hard_delete_user_cascades_and_removes_related_data(admin_user, target_user, other_user):
    # Setup some related data
    # 1. AuctionItem and Auction owned by target_user
    item = AuctionItem.objects.create(
        seller=target_user,
        title="Rare item",
        starting_price=100.0,
        current_price=100.0,
        minimum_increment=5.0,
    )
    from django.utils import timezone
    from datetime import timedelta
    auction = Auction.objects.create(
        item=item,
        start_time=timezone.now(),
        end_time=timezone.now() + timedelta(days=1),
    )
    # 2. Bid by target_user
    other_item = AuctionItem.objects.create(
        seller=other_user,
        title="Other item",
        starting_price=200.0,
        current_price=200.0,
        minimum_increment=10.0,
    )
    other_auction = Auction.objects.create(
        item=other_item,
        start_time=timezone.now(),
        end_time=timezone.now() + timedelta(days=1),
    )
    bid = Bid.objects.create(
        auction=other_auction,
        bidder=target_user,
        amount=250.0,
    )
    # 3. Chat Room messages
    from apps.chat.models import ChatRoom
    room = ChatRoom.objects.create(auction=other_auction, name="Test room")
    message = Message.objects.create(
        room=room,
        sender=target_user,
        message="Hey guys!",
    )
    # 4. Private Conversation and messages
    private_conv = PrivateConversation.objects.create(
        user_one=target_user,
        user_two=other_user,
    )
    private_msg = PrivateMessage.objects.create(
        conversation=private_conv,
        sender=target_user,
        message="Private hello",
    )
    # 5. Friendship
    friendship = Friendship.objects.create(
        requester=target_user,
        addressee=other_user,
    )
    # 6. Notifications
    notif = Notification.objects.create(
        user=target_user,
        type="NEW_BID",
        title="New bid",
        content="You got a bid!",
    )
    # 7. AnalyticsEvents
    event = AnalyticsEvent.objects.create(
        user=target_user,
        event_type="test.event",
    )
    # 8. Reports targeting target_user
    report = Report.objects.create(
        reporter=other_user,
        target_type=ReportTargetType.USER,
        target_id=target_user.id,
        reason=ReportReason.SPAM,
        description="Spamming user",
    )

    client = APIClient()
    client.force_authenticate(user=admin_user)

    response = client.delete(f"/api/users/{target_user.id}/hard-delete/")
    assert response.status_code == status.HTTP_200_OK

    # Assert user is deleted completely
    assert not User.objects.filter(id=target_user.id).exists()

    # Assert cascades
    assert not AuctionItem.objects.filter(id=item.id).exists()
    assert not Auction.objects.filter(id=auction.id).exists()
    assert not Bid.objects.filter(id=bid.id).exists()
    assert not Message.objects.filter(id=message.id).exists()
    assert not PrivateConversation.objects.filter(id=private_conv.id).exists()
    assert not PrivateMessage.objects.filter(id=private_msg.id).exists()
    assert not Friendship.objects.filter(id=friendship.id).exists()
    assert not Notification.objects.filter(id=notif.id).exists()
    assert not AnalyticsEvent.objects.filter(id=event.id).exists()
    assert not Report.objects.filter(id=report.id).exists()

    # Verify audit logs for the deleted user were also removed
    assert not PermissionAuditLog.objects.filter(target_user=target_user).exists()
