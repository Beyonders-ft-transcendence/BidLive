import json
from datetime import timedelta
from decimal import Decimal

import pytest
import jwt
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from rest_framework.test import APIClient

from apps.auctions.models import Auction, AuctionItem, AuctionStatus, LiveStream, LiveStreamStatus
from apps.auctions.services import end_stream
from apps.users.models import Permission, Role, RolePermission, User, UserRole
from apps.users.selectors import invalidate_user_permissions_cache


@pytest.fixture(autouse=True)
def mock_livekit_room_service(monkeypatch):
    rooms = {}

    class FakeResponse:
        def __init__(self, status_code=200, payload=None):
            self.status_code = status_code
            self._payload = payload if payload is not None else {}

        @property
        def ok(self):
            return 200 <= self.status_code < 300

        @property
        def content(self):
            if self._payload is None:
                return b""
            return json.dumps(self._payload).encode("utf-8")

        def json(self):
            return self._payload

        @property
        def text(self):
            return json.dumps(self._payload)

    def fake_post(url, json=None, headers=None, timeout=None):
        method = url.rsplit("/", 1)[-1]
        body = json or {}
        if method == "ListRooms":
            names = body.get("names") or []
            return FakeResponse(200, {"rooms": [rooms[name] for name in names if name in rooms]})
        if method == "CreateRoom":
            room = {
                "sid": f"RM_{len(rooms) + 1}",
                "name": body["name"],
                "metadata": body.get("metadata", ""),
                "num_participants": 0,
            }
            rooms[room["name"]] = room
            return FakeResponse(200, room)
        if method == "UpdateRoomMetadata":
            room = rooms.get(body["room"])
            if room is None:
                return FakeResponse(404, {"code": "not_found", "msg": "room not found"})
            room["metadata"] = body.get("metadata", "")
            return FakeResponse(200, room)
        if method == "DeleteRoom":
            room_name = body["room"]
            if room_name not in rooms:
                return FakeResponse(404, {"code": "not_found", "msg": "room not found"})
            rooms.pop(room_name, None)
            return FakeResponse(200, {})
        raise AssertionError(f"Unexpected LiveKit method: {method}")

    monkeypatch.setattr("apps.auctions.services.livekit_client.requests.post", fake_post)


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


def test_stream_livekit_token_endpoint_issues_broadcaster_token(db, user):
    cache.clear()
    _grant_permissions(user, ["auction.read", "auction.update"])
    auction = _create_live_auction(seller=user, title="LiveKit Broadcaster")

    client = APIClient()
    client.force_authenticate(user=user)

    create_response = client.post(
        f"/api/auctions/{auction.id}/streams/",
        {"title": "LiveKit Stream", "visibility": "PUBLIC"},
        format="json",
    )
    assert create_response.status_code == 201
    stream_id = create_response.data["data"]["id"]

    token_response = client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/livekit-token/",
        {"role": "broadcaster", "participant_name": "Main Camera"},
        format="json",
    )

    assert token_response.status_code == 200
    payload = token_response.data["data"]
    decoded = jwt.decode(payload["token"], settings.LIVEKIT_API_SECRET, algorithms=["HS256"])

    assert payload["role"] == "broadcaster"
    assert payload["can_publish"] is True
    assert payload["can_subscribe"] is True
    assert payload["room_name"] == f"auction-{auction.id}-stream-{stream_id}"
    assert payload["url"] == settings.LIVEKIT_PUBLIC_URL
    assert decoded["iss"] == settings.LIVEKIT_API_KEY
    assert decoded["video"]["room"] == payload["room_name"]
    assert decoded["video"]["canPublish"] is True
    assert decoded["video"]["canSubscribe"] is True
    decoded_metadata = json.loads(decoded["metadata"])
    assert decoded_metadata["role"] == "broadcaster"
    assert decoded_metadata["stream_id"] == stream_id
    assert decoded_metadata["auction_id"] == auction.id


def test_stream_livekit_token_endpoint_issues_viewer_token_for_live_stream(db, user, other_user):
    cache.clear()
    _grant_permissions(user, ["auction.read", "auction.update"])
    _grant_permissions(other_user, ["auction.read"])
    auction = _create_live_auction(seller=user, title="LiveKit Viewer")

    owner_client = APIClient()
    owner_client.force_authenticate(user=user)
    create_response = owner_client.post(
        f"/api/auctions/{auction.id}/streams/",
        {"title": "LiveKit Viewer Stream", "visibility": "PUBLIC"},
        format="json",
    )
    assert create_response.status_code == 201
    stream_id = create_response.data["data"]["id"]
    stream_key = create_response.data["data"]["stream_key"]

    start_response = owner_client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/start/",
        {"stream_key": stream_key},
        format="json",
    )
    assert start_response.status_code == 200

    viewer_client = APIClient()
    viewer_client.force_authenticate(user=other_user)
    token_response = viewer_client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/livekit-token/",
        {"role": "viewer"},
        format="json",
    )

    assert token_response.status_code == 200
    payload = token_response.data["data"]
    decoded = jwt.decode(payload["token"], settings.LIVEKIT_API_SECRET, algorithms=["HS256"])

    assert payload["role"] == "viewer"
    assert payload["can_publish"] is False
    assert payload["can_subscribe"] is True
    assert payload["room_name"] == f"auction-{auction.id}-stream-{stream_id}"
    assert payload["url"] == settings.LIVEKIT_PUBLIC_URL
    assert decoded["video"]["canPublish"] is False
    assert decoded["video"]["canSubscribe"] is True


def test_stream_livekit_token_endpoint_rejects_viewer_before_stream_is_live(db, user, other_user):
    cache.clear()
    _grant_permissions(user, ["auction.read", "auction.update"])
    _grant_permissions(other_user, ["auction.read"])
    auction = _create_live_auction(seller=user, title="LiveKit Viewer Denied")

    owner_client = APIClient()
    owner_client.force_authenticate(user=user)
    create_response = owner_client.post(
        f"/api/auctions/{auction.id}/streams/",
        {"title": "LiveKit Viewer Denied Stream", "visibility": "PUBLIC"},
        format="json",
    )
    assert create_response.status_code == 201
    stream_id = create_response.data["data"]["id"]

    viewer_client = APIClient()
    viewer_client.force_authenticate(user=other_user)
    token_response = viewer_client.post(
        f"/api/auctions/{auction.id}/streams/{stream_id}/livekit-token/",
        {"role": "viewer"},
        format="json",
    )

    assert token_response.status_code == 403
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
