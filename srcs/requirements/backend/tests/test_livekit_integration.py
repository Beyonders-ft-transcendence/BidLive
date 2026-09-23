import base64
import hashlib
import json
from datetime import timedelta
from decimal import Decimal

import jwt
import pytest
from django.conf import settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.auctions.models import Auction, AuctionItem, AuctionStatus, LiveStream, LiveStreamStatus, StreamViewer
from apps.auctions.services import ensure_livekit_room, remove_livekit_room
from apps.auctions.services.room_service import build_livekit_room_name


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

    def fake_post(url, json=None, headers=None, timeout=None, **kwargs):
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
    return rooms


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
    return LiveStream.objects.create(
        auction=auction,
        streamer=streamer,
        stream_key="sk_live_teststreamkey123",
        stream_key_hash="",
        title=title,
        status=LiveStreamStatus.READY,
        is_live=False,
    )


def _build_webhook_auth(body: str) -> str:
    sha256 = base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode("utf-8")
    now = int(timezone.now().timestamp())
    token = jwt.encode(
        {
            "iss": settings.LIVEKIT_API_KEY,
            "sub": "livekit-webhook",
            "iat": now,
            "nbf": now - 10,
            "exp": now + 300,
            "sha256": sha256,
        },
        settings.LIVEKIT_API_SECRET,
        algorithm="HS256",
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def _send_webhook(client: APIClient, payload: dict, *, token: str | None = None):
    body = json.dumps(payload)
    auth_token = token or _build_webhook_auth(body)
    return client.post(
        "/api/livekit/webhook/",
        data=body,
        content_type="application/webhook+json",
        HTTP_AUTHORIZATION=f"Bearer {auth_token}",
    )


def test_livekit_room_service_creates_and_updates_room_metadata(db, user):
    stream_auction = _create_live_auction(seller=user, title="Room Service Auction")
    stream = _create_stream(auction=stream_auction, streamer=user, title="First title")

    room = ensure_livekit_room(stream=stream)
    assert room["name"] == build_livekit_room_name(stream=stream)
    assert room["metadata"]

    stream.title = "Updated title"
    stream.save(update_fields=["title", "updated_at"])
    room_again = ensure_livekit_room(stream=stream)
    assert room_again["name"] == room["name"]
    assert "Updated title" in room_again["metadata"]


def test_livekit_room_service_delete_is_idempotent(db, user):
    auction = _create_live_auction(seller=user, title="Delete Room Auction")
    stream = _create_stream(auction=auction, streamer=user, title="Delete room")

    ensure_livekit_room(stream=stream)
    remove_livekit_room(stream=stream)
    remove_livekit_room(stream=stream)


def test_livekit_webhook_updates_stream_presence_and_lifecycle(db, user, other_user):
    auction = _create_live_auction(seller=user, title="Webhook Auction")
    stream = _create_stream(auction=auction, streamer=user, title="Webhook Stream")

    client = APIClient()
    room_name = build_livekit_room_name(stream=stream)
    room_metadata = {"auction_id": auction.id, "stream_id": stream.id, "streamer_id": user.id, "role": "room"}

    start_payload = {
        "id": "evt_room_started",
        "event": "room_started",
        "createdAt": int(timezone.now().timestamp()),
        "room": {"name": room_name, "metadata": json.dumps(room_metadata)},
    }
    response = _send_webhook(client, start_payload)
    assert response.status_code == 204

    stream.refresh_from_db()
    assert stream.status == LiveStreamStatus.LIVE
    assert stream.is_live is True

    joined_payload = {
        "id": "evt_participant_joined",
        "event": "participant_joined",
        "createdAt": int(timezone.now().timestamp()),
        "room": {"name": room_name, "metadata": json.dumps(room_metadata)},
        "participant": {
            "identity": f"viewer-{stream.id}-{other_user.id}",
            "name": other_user.username,
            "metadata": json.dumps({"user_id": other_user.id, "role": "viewer"}),
        },
    }
    response = _send_webhook(client, joined_payload)
    assert response.status_code == 204

    stream.refresh_from_db()
    assert stream.viewer_count == 1
    assert StreamViewer.objects.filter(stream=stream, viewer=other_user).exists()

    left_payload = {
        "id": "evt_participant_left",
        "event": "participant_left",
        "createdAt": int(timezone.now().timestamp()),
        "room": {"name": room_name, "metadata": json.dumps(room_metadata)},
        "participant": {
            "identity": f"viewer-{stream.id}-{other_user.id}",
            "name": other_user.username,
            "metadata": json.dumps({"user_id": other_user.id, "role": "viewer"}),
        },
    }
    response = _send_webhook(client, left_payload)
    assert response.status_code == 204

    stream.refresh_from_db()
    assert stream.viewer_count == 0
    assert not StreamViewer.objects.filter(stream=stream, viewer=other_user).exists()

    finished_payload = {
        "id": "evt_room_finished",
        "event": "room_finished",
        "createdAt": int(timezone.now().timestamp()),
        "room": {"name": room_name, "metadata": json.dumps(room_metadata)},
    }
    response = _send_webhook(client, finished_payload)
    assert response.status_code == 204

    stream.refresh_from_db()
    assert stream.status == LiveStreamStatus.ENDED
    assert stream.is_live is False


def test_livekit_webhook_rejects_invalid_signature(db, user):
    auction = _create_live_auction(seller=user, title="Bad Signature Auction")
    stream = _create_stream(auction=auction, streamer=user, title="Bad Signature Stream")
    client = APIClient()
    payload = {
        "id": "evt_invalid_signature",
        "event": "room_started",
        "createdAt": int(timezone.now().timestamp()),
        "room": {"name": build_livekit_room_name(stream=stream), "metadata": json.dumps({})},
    }
    response = _send_webhook(client, payload, token="invalid")
    assert response.status_code == 403
