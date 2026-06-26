import pytest
from django.core.management import call_command
from django.test import override_settings

from apps.analytics.models import AnalyticsEvent
from apps.auctions.models import Auction, AuctionItem, LiveStream
from apps.chat.models import Message
from apps.notifications.models import Notification
from apps.reports.models import Report
from apps.users.models import User
from apps.users.seed.demo_data import DEMO_EMAIL_DOMAIN
from apps.users.seed.seed_service import clear_demo_data, demo_users_exist, seed_demo_data


@pytest.mark.django_db
def test_seed_demo_data_creates_users_and_auctions():
    if demo_users_exist():
        clear_demo_data()

    result = seed_demo_data(password="demo1234")

    assert result["users"] == 8
    assert User.objects.filter(email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count() == 8
    assert AuctionItem.objects.filter(seller__email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count() == 12
    auction_qs = Auction.objects.filter(item__seller__email__iendswith=f"@{DEMO_EMAIL_DOMAIN}")
    assert auction_qs.count() == 12
    assert LiveStream.objects.filter(auction__in=auction_qs, is_live=True).count() == 3
    assert Message.objects.filter(room__auction__in=auction_qs).count() == 6
    assert Notification.objects.filter(user__email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count() == 6
    assert Report.objects.filter(reporter__email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count() == 3
    analytics_qs = AnalyticsEvent.objects.filter(user__email__iendswith=f"@{DEMO_EMAIL_DOMAIN}")
    assert analytics_qs.count() == 14


@pytest.mark.django_db
@override_settings(DEBUG=True)
def test_seed_management_command_is_idempotent():
    if demo_users_exist():
        clear_demo_data()

    call_command("seed", password="demo1234")
    users_after_first = User.objects.filter(email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count()

    call_command("seed", password="demo1234")
    users_after_second = User.objects.filter(email__iendswith=f"@{DEMO_EMAIL_DOMAIN}").count()

    assert users_after_first == users_after_second == 8


@pytest.mark.django_db
@override_settings(DEBUG=True)
def test_seed_clear_removes_demo_users():
    if not demo_users_exist():
        seed_demo_data(password="demo1234")

    call_command("seed", "--clear")

    assert not demo_users_exist()
