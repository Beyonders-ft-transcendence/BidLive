import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from decimal import Decimal
from urllib.parse import unquote, urlparse

import pytest
from asgiref.testing import ApplicationCommunicator
from django.core.cache import cache
from django.db import close_old_connections
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from apps.auctions.models import Auction, AuctionAuditLog, AuctionItem, AuctionStatus, Bid
from apps.auctions.services import place_bid
from apps.users.models import Permission, Role, RolePermission, User, UserRole, UserStatus
from apps.users.selectors import invalidate_user_permissions_cache
from config.asgi import application


class WebsocketCommunicator(ApplicationCommunicator):
    def __init__(self, application, path, headers=None, subprotocols=None):
        parsed = urlparse(path)
        scope = {
            "type": "websocket",
            "path": unquote(parsed.path),
            "query_string": parsed.query.encode("utf-8"),
            "headers": headers or [],
            "subprotocols": subprotocols or [],
        }
        super().__init__(application, scope)

    async def connect(self, timeout=1):
        await self.send_input({"type": "websocket.connect"})
        response = await self.receive_output(timeout)
        if response["type"] == "websocket.close":
            return False, response.get("code", 1000)
        assert response["type"] == "websocket.accept"
        return True, response.get("subprotocol")

    async def send_json_to(self, data):
        await self.send_input({"type": "websocket.receive", "text": json.dumps(data)})

    async def receive_json_from(self, timeout=1):
        response = await self.receive_output(timeout)
        assert response["type"] == "websocket.send"
        return json.loads(response["text"])

    async def disconnect(self, code=1000, timeout=1):
        await self.send_input({"type": "websocket.disconnect", "code": code})
        await self.wait(timeout)


def _grant_permissions(user, permissions):
    role, _ = Role.objects.get_or_create(name="AUCTION_REALTIME_TEST_ROLE")
    for name in permissions:
        permission, _ = Permission.objects.get_or_create(name=name)
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)


def _create_live_auction(*, seller, title="Console", starting_price="100.00", minimum_increment="10.00") -> Auction:
    now = timezone.now()
    item = AuctionItem.objects.create(
        seller=seller,
        title=title,
        description=f"{title} description",
        starting_price=Decimal(starting_price),
        current_price=Decimal(starting_price),
        minimum_increment=Decimal(minimum_increment),
    )
    return Auction.objects.create(
        item=item,
        start_time=now - timedelta(minutes=5),
        end_time=now + timedelta(hours=1),
        status=AuctionStatus.LIVE,
        started_at=now - timedelta(minutes=5),
    )


@pytest.mark.django_db
def test_bid_history_is_paginated_newest_first_and_includes_metadata(user):
    _grant_permissions(user, ["auction.read"])
    auction = _create_live_auction(seller=user, title="History Item")

    bidder = User.objects.create_user(
        email="history@example.com",
        username="history_bidder",
        full_name="History Bidder",
        password="pass",
    )
    older_bid = Bid.objects.create(
        auction=auction,
        bidder=bidder,
        amount=Decimal("120.00"),
        metadata={"channel": "api"},
        ip_address="10.0.0.1",
    )
    newer_bid = Bid.objects.create(
        auction=auction,
        bidder=bidder,
        amount=Decimal("110.00"),
        metadata={"channel": "ws"},
        ip_address="10.0.0.2",
    )
    Bid.objects.filter(pk=older_bid.pk).update(created_at=timezone.now() - timedelta(minutes=2))
    Bid.objects.filter(pk=newer_bid.pk).update(created_at=timezone.now() - timedelta(minutes=1))

    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get(f"/api/auctions/{auction.id}/bids/?page_size=1")

    assert response.status_code == 200
    assert response.data["data"]["count"] == 2
    assert len(response.data["data"]["results"]) == 1
    result = response.data["data"]["results"][0]
    assert result["id"] == newer_bid.id
    assert result["metadata"] == {"channel": "ws"}
    assert result["ip_address"] == "10.0.0.2"
    assert result["bidder"]["username"] == "history_bidder"


@pytest.mark.django_db
def test_bid_api_rejects_self_bidding_and_banned_users(user):
    _grant_permissions(user, ["auction.read"])
    auction = _create_live_auction(seller=user, title="Validation Item")

    seller_client = APIClient()
    seller_client.force_authenticate(user=user)
    self_bid_response = seller_client.post(
        f"/api/auctions/{auction.id}/bids/",
        {"amount": "110.00"},
        format="json",
    )

    assert self_bid_response.status_code == 400
    assert AuctionAuditLog.objects.filter(
        auction=auction,
        actor=user,
        action="auction.bid_rejected",
        metadata__reason="self_bidding",
    ).exists()

    banned_user = User.objects.create_user(
        email="banned@example.com",
        username="banned_bidder",
        full_name="Banned Bidder",
        password="pass",
        status=UserStatus.BANNED,
    )
    _grant_permissions(banned_user, ["auction.read"])

    banned_client = APIClient()
    banned_client.force_authenticate(user=banned_user)
    banned_response = banned_client.post(
        f"/api/auctions/{auction.id}/bids/",
        {"amount": "110.00"},
        format="json",
    )

    assert banned_response.status_code == 400
    assert AuctionAuditLog.objects.filter(
        auction=auction,
        actor=banned_user,
        action="auction.bid_rejected",
        metadata__reason="user_blocked",
    ).exists()


@pytest.mark.django_db
@override_settings(
    AUCTION_BID_RATE_LIMIT_COUNT=1,
    AUCTION_BID_RATE_LIMIT_WINDOW_SECONDS=60,
    AUCTION_BID_RATE_LIMIT_BLOCK_SECONDS=30,
)
def test_bid_api_rate_limits_repeat_bid_attempts(user):
    cache.clear()
    seller = user
    auction = _create_live_auction(seller=seller, title="Throttle Item")

    bidder = User.objects.create_user(
        email="throttle@example.com",
        username="throttle_bidder",
        full_name="Throttle Bidder",
        password="pass",
    )
    _grant_permissions(bidder, ["auction.read"])

    client = APIClient()
    client.force_authenticate(user=bidder)

    first = client.post(
        f"/api/auctions/{auction.id}/bids/",
        {"amount": "110.00"},
        format="json",
        REMOTE_ADDR="127.0.0.1",
    )
    second = client.post(
        f"/api/auctions/{auction.id}/bids/",
        {"amount": "120.00"},
        format="json",
        REMOTE_ADDR="127.0.0.1",
    )

    assert first.status_code == 200
    assert second.status_code == 400
    errors = second.data["errors"][0]
    assert "throttle" in errors
    assert errors["retry_after"] == 30


@pytest.mark.django_db(transaction=True)
def test_place_bid_is_safe_under_same_amount_race(monkeypatch, user):
    cache.clear()
    seller = user
    auction = _create_live_auction(seller=seller, title="Race Item")

    bidder_one = User.objects.create_user(
        email="race1@example.com",
        username="race_one",
        full_name="Race One",
        password="pass",
    )
    bidder_two = User.objects.create_user(
        email="race2@example.com",
        username="race_two",
        full_name="Race Two",
        password="pass",
    )

    monkeypatch.setattr("apps.auctions.services.auction_service.notify_auction_watchers", lambda *args, **kwargs: 0)
    monkeypatch.setattr("apps.auctions.services.auction_service.notify_outbid", lambda *args, **kwargs: None)
    monkeypatch.setattr("apps.auctions.services.auction_service.publish_auction_event", lambda *args, **kwargs: None)
    monkeypatch.setattr("apps.auctions.services.auction_service.publish_auction_snapshot", lambda *args, **kwargs: None)

    def _attempt_bid(user_id: int) -> tuple[bool, str]:
        close_old_connections()
        local_user = User.objects.get(pk=user_id)
        local_auction = Auction.objects.select_related("item").get(pk=auction.id)
        try:
            place_bid(
                bidder=local_user,
                auction=local_auction,
                amount=Decimal("110.00"),
                ip_address=f"10.0.0.{user_id}",
            )
            return True, "ok"
        except Exception as exc:  # noqa: BLE001
            return False, str(exc)
        finally:
            close_old_connections()

    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [
            executor.submit(_attempt_bid, bidder_one.id),
            executor.submit(_attempt_bid, bidder_two.id),
        ]
    results = [future.result() for future in futures]

    auction.refresh_from_db()
    auction.item.refresh_from_db()
    bids = list(Bid.objects.filter(auction=auction))

    assert sum(1 for success, _ in results if success) == 1
    assert len(bids) == 1
    assert auction.item.current_price == Decimal("110.00")


@pytest.mark.django_db(transaction=True)
def test_auction_websocket_connects_and_processes_realtime_bid(user):
    cache.clear()
    _grant_permissions(user, ["auction.read"])
    seller = User.objects.create_user(
        email="seller-ws@example.com",
        username="seller_ws",
        full_name="Seller Ws",
        password="pass",
    )
    auction = _create_live_auction(seller=seller, title="Websocket Item")

    async def _scenario():
        token = str(AccessToken.for_user(user))
        communicator = WebsocketCommunicator(
            application,
            f"/ws/auctions/{auction.id}/?token={token}",
        )
        connected, _ = await communicator.connect()
        assert connected is True

        first_event = await communicator.receive_json_from()
        second_event = await communicator.receive_json_from()
        assert first_event["event"] == "auction_snapshot"
        assert second_event["event"] == "user_joined"

        await communicator.send_json_to(
            {"action": "place_bid", "amount": "110.00", "metadata": {"channel": "ws"}}
        )

        received_events = [await communicator.receive_json_from() for _ in range(4)]
        event_names = [event["event"] for event in received_events]

        assert "bid_accepted" in event_names
        assert "new_bid" in event_names
        assert "timer_update" in event_names
        assert "auction_snapshot" in event_names

        new_bid_event = next(event for event in received_events if event["event"] == "new_bid")
        assert new_bid_event["payload"]["bid_amount"] == "110.00"
        assert new_bid_event["payload"]["metadata"] == {"channel": "ws"}
        assert new_bid_event["payload"]["bidder"]["username"] == "test_user"

        await communicator.disconnect()

    asyncio.run(_scenario())
