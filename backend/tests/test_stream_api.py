import asyncio
import json
from datetime import timedelta
from decimal import Decimal
from urllib.parse import unquote, urlparse

import pytest
from asgiref.testing import ApplicationCommunicator
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from apps.auctions.models import Auction, AuctionItem, AuctionStatus, LiveStream, LiveStreamStatus
from apps.auctions.services import end_stream
from apps.users.models import Permission, Role, RolePermission, User, UserRole
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
    role, _ = Role.objects.get_or_create(name="STREAM_TEST_ROLE")
    for name in permissions:
        permission, _ = Permission.objects.get_or_create(name=name)
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)


def _create_live_auction(*, seller, title="Live Item") -> Auction:
    now = timezone.now()
    item = AuctionItem.objects.create(
        seller=seller,
        title=title,
        description=f"{title} description",
        starting_price=Decimal("100.00"),
        current_price=Decimal("100.00"),
        minimum_increment=Decimal("10.00"),
    )
    return Auction.objects.create(
        item=item,
        start_time=now - timedelta(minutes=5),
        end_time=now + timedelta(hours=1),
        status=AuctionStatus.LIVE,
        started_at=now - timedelta(minutes=5),
    )


def _create_stream(*, auction, streamer, title="Weekend Live") -> LiveStream:
    stream = LiveStream.objects.create(
        auction=auction,
        streamer=streamer,
        stream_key="sk_live_teststreamkey123",
        stream_key_hash="",
        title=title,
        status=LiveStreamStatus.READY,
        is_live=False,
    )
    stream.stream_key_hash = ""
    stream.save(update_fields=["stream_key_hash"])
    return stream


def test_stream_api_lifecycle(db, user):
    cache.clear()
    _grant_permissions(user, ["auction.read", "auction.update"])
    auction = _create_live_auction(seller=user)

    client = APIClient()
    client.force_authenticate(user=user)

    create_response = client.post(
        f"/api/auctions/{auction.id}/streams/",
        {"title": "My Live", "description": "Demo", "visibility": "PUBLIC"},
        format="json",
    )
    assert create_response.status_code == 201
    stream_id = create_response.data["data"]["id"]
    stream_key = create_response.data["data"]["stream_key"]
    assert create_response.data["data"]["status"] == "READY"
    assert create_response.data["data"]["is_live"] is False

    start_response = client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/start/",
        {"stream_key": stream_key},
        format="json",
    )
    assert start_response.status_code == 200
    assert start_response.data["data"]["status"] == "LIVE"
    assert start_response.data["data"]["is_live"] is True

    viewers_response = client.get(f"/api/auctions/{auction.id}/streams/{stream_id}/viewers/")
    assert viewers_response.status_code == 200
    assert viewers_response.data["data"]["count"] == 0

    end_response = client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/end/",
        {"reason": "done"},
        format="json",
    )
    assert end_response.status_code == 200
    assert end_response.data["data"]["status"] == "ENDED"


@pytest.mark.django_db(transaction=True)
def test_stream_websocket_presence_and_heartbeat(db, user, other_user):
    cache.clear()
    _grant_permissions(user, ["auction.read", "auction.update"])
    _grant_permissions(other_user, ["auction.read"])
    auction = _create_live_auction(seller=user, title="Realtime Live")
    stream = _create_stream(auction=auction, streamer=user)
    stream.status = LiveStreamStatus.LIVE
    stream.is_live = True
    stream.started_at = timezone.now()
    stream.save(update_fields=["status", "is_live", "started_at"])

    async def _scenario():
        token = str(AccessToken.for_user(other_user))
        communicator = WebsocketCommunicator(
            application,
            f"/ws/auctions/{auction.id}/streams/{stream.id}/?token={token}",
        )
        connected, _ = await communicator.connect()
        assert connected is True

        first_event = await communicator.receive_json_from()
        second_event = await communicator.receive_json_from()
        event_names = {first_event["event"], second_event["event"]}
        assert "stream_snapshot" in event_names
        assert "viewer_joined" in event_names or "viewer_count_updated" in event_names

        await communicator.send_json_to({"action": "ping"})
        pong = await communicator.receive_json_from()
        assert pong["event"] == "pong"

        await communicator.disconnect()

    asyncio.run(_scenario())


def test_stream_end_service_closes_live_stream(db, user):
    cache.clear()
    auction = _create_live_auction(seller=user, title="End Live")
    stream = _create_stream(auction=auction, streamer=user)
    stream.status = LiveStreamStatus.LIVE
    stream.is_live = True
    stream.started_at = timezone.now()
    stream.viewer_count = 3
    stream.save(update_fields=["status", "is_live", "started_at", "viewer_count"])

    ended = end_stream(actor=user, stream=stream, reason="test")
    assert ended.status == LiveStreamStatus.ENDED
    ended.refresh_from_db()
    assert ended.is_live is False
    assert ended.ended_at is not None
