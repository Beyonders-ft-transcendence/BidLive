import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User, Role, UserRole
from apps.analytics.models import AnalyticsEvent
from apps.auctions.models import AuctionItem, Auction, Bid

@pytest.fixture()
def staff_user(db):
    user = User.objects.create_user(
        email="staff@example.com",
        username="staff_user",
        full_name="Staff User",
        password="password123",
        is_staff=True,
    )
    return user

@pytest.fixture()
def regular_user(db):
    user = User.objects.create_user(
        email="regular@example.com",
        username="regular_user",
        full_name="Regular User",
        password="password123",
    )
    return user

@pytest.mark.django_db
def test_post_event_triggers_celery_and_saves_event(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)

    event_payload = {
        "event_type": "auction.page_view",
        "metadata": {"auction_id": 42}
    }

    response = client.post(
        "/api/analytics/events/",
        event_payload,
        format="json"
    )

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert response.data["success"] is True

    # Assert that the event is actually written in the database (since CELERY_TASK_ALWAYS_EAGER is True in development settings)
    event = AnalyticsEvent.objects.get(event_type="auction.page_view")
    assert event.user == regular_user
    assert event.metadata == {"auction_id": 42}

@pytest.mark.django_db
def test_post_event_anonymous_user():
    client = APIClient()

    event_payload = {
        "event_type": "visitor.click",
        "metadata": {"button_id": "signup_btn"}
    }

    response = client.post(
        "/api/analytics/events/",
        event_payload,
        format="json"
    )

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert response.data["success"] is True

    event = AnalyticsEvent.objects.get(event_type="visitor.click")
    assert event.user is None
    assert event.metadata == {"button_id": "signup_btn"}

@pytest.mark.django_db
def test_get_stats_requires_staff_user(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)

    response = client.get("/api/analytics/stats/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_get_stats_anonymous_user():
    client = APIClient()

    response = client.get("/api/analytics/stats/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_get_stats_returns_correct_aggregates(staff_user, regular_user):
    # Setup stats: active users
    # We update last_seen for regular_user and staff_user to be in the last hour
    regular_user.last_seen = timezone.now() - timedelta(minutes=10)
    regular_user.is_online = True
    regular_user.save()

    staff_user.last_seen = timezone.now() - timedelta(minutes=5)
    staff_user.save()

    # Create ended/sold auctions
    item = AuctionItem.objects.create(
        seller=regular_user,
        title="Converted Item",
        starting_price=100.0,
        current_price=150.0,
        minimum_increment=5.0,
    )
    from apps.auctions.models import AuctionStatus
    auction = Auction.objects.create(
        item=item,
        start_time=timezone.now() - timedelta(hours=2),
        end_time=timezone.now() - timedelta(hours=1),
        status=AuctionStatus.SOLD,
    )
    bid = Bid.objects.create(
        auction=auction,
        bidder=regular_user,
        amount=150.0,
    )

    # Log some events
    AnalyticsEvent.objects.create(user=regular_user, event_type="test.event")

    client = APIClient()
    client.force_authenticate(user=staff_user)

    response = client.get("/api/analytics/stats/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["success"] is True
    
    data = response.data["data"]
    assert "active_users" in data
    assert data["active_users"]["active_last_hour"] == 2  # staff_user and regular_user
    assert data["active_users"]["online_now"] == 1  # regular_user
    
    assert "bids_activity" in data
    assert len(data["bids_activity"]["bids_per_hour_last_24h"]) >= 1
    
    assert "conversion_metrics" in data
    assert data["conversion_metrics"]["auction_conversion_rate_percentage"] == 100.0
    assert data["conversion_metrics"]["bidder_engagement_rate_percentage"] == 50.0  # regular_user bids, staff_user doesn't
