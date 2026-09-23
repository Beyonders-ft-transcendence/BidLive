from __future__ import annotations

import base64
import hashlib
import json
import re
from dataclasses import dataclass

import jwt
from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.analytics.services import track_event
from apps.auctions.models import LiveStream, LiveStreamStatus
from apps.auctions.services.presence_service import set_stream_presence_count
from apps.auctions.services.stream_service import end_stream, join_stream, leave_stream
from apps.users.models import User


LIVEKIT_WEBHOOK_EVENTS = {
    "room_started",
    "room_finished",
    "participant_joined",
    "participant_left",
    "participant_connection_aborted",
    "track_published",
    "track_unpublished",
}

ROOM_NAME_RE = re.compile(r"^auction-(?P<auction_id>\d+)-stream-(?P<stream_id>\d+)$")


@dataclass(slots=True)
class LiveKitWebhookContext:
    event_name: str
    event_id: str
    stream: LiveStream
    room_name: str
    room_metadata: dict
    payload: dict


def _parse_json_payload(value) -> dict:
    if not value:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {}


import logging

logger = logging.getLogger(__name__)


def _parse_authorization_header(authorization: str) -> str:
    if not authorization:
        raise PermissionDenied("Missing LiveKit webhook authorization.")
    prefix = "bearer "
    if not authorization.lower().startswith(prefix):
        raise PermissionDenied("Invalid LiveKit webhook authorization.")
    return authorization[len(prefix) :].strip()


def verify_livekit_webhook(*, body: str | bytes, authorization: str) -> dict:
    token = _parse_authorization_header(authorization)
    expected_secret = getattr(settings, "LIVEKIT_API_SECRET", "")
    expected_key = getattr(settings, "LIVEKIT_API_KEY", "")

    try:
        claims = jwt.decode(
            token,
            key=expected_secret,
            algorithms=["HS256"],
            leeway=30,
            options={"verify_issuer": False},
        )
    except Exception as exc:
        logger.error(
            "LiveKit webhook signature verification failed: %s (token prefix: %s)",
            exc,
            token[:20] if token else "",
        )
        raise PermissionDenied(f"Invalid LiveKit webhook signature: {exc}") from exc

    token_iss = claims.get("iss")
    if token_iss and expected_key and token_iss != expected_key:
        logger.error(
            "LiveKit webhook issuer mismatch: received '%s', expected '%s'",
            token_iss,
            expected_key,
        )
        raise PermissionDenied("Invalid LiveKit webhook issuer.")

    sha256_claim = claims.get("sha256")
    if not sha256_claim:
        logger.error("LiveKit webhook token missing sha256 claim. Claims: %s", list(claims.keys()))
        raise PermissionDenied("LiveKit webhook hash is missing.")

    body_bytes = body if isinstance(body, bytes) else body.encode("utf-8")
    actual_digest = hashlib.sha256(body_bytes).digest()
    actual_b64 = base64.b64encode(actual_digest).decode()
    actual_urlsafe_b64 = base64.urlsafe_b64encode(actual_digest).decode().rstrip("=")
    actual_hex = hashlib.sha256(body_bytes).hexdigest()

    # Match against standard base64, urlsafe base64, hex, or decoded raw digest
    matched = False
    if sha256_claim in (actual_b64, actual_urlsafe_b64, actual_hex):
        matched = True
    else:
        try:
            # Add padding if missing and compare bytes
            padded = sha256_claim + "=" * (-len(sha256_claim) % 4)
            if base64.b64decode(padded) == actual_digest:
                matched = True
        except Exception:
            pass

    if not matched:
        logger.error(
            "LiveKit webhook payload hash mismatch: claim='%s', computed_b64='%s'",
            sha256_claim,
            actual_b64,
        )
        raise PermissionDenied("LiveKit webhook payload hash mismatch.")

    try:
        payload_str = body_bytes.decode("utf-8")
        payload = json.loads(payload_str)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValidationError({"body": ["Invalid JSON payload."]}) from exc

    if not isinstance(payload, dict):
        raise ValidationError({"body": ["Invalid webhook payload."]})
    return payload


def _resolve_stream_from_room(*, room: dict) -> LiveStream:
    room_name = str(room.get("name") or "")
    metadata = _parse_json_payload(room.get("metadata"))
    stream_id = metadata.get("stream_id")
    if stream_id:
        try:
            return LiveStream.objects.select_related("auction", "streamer", "thumbnail", "auction__item").get(
                pk=int(stream_id)
            )
        except LiveStream.DoesNotExist:
            pass

    match = ROOM_NAME_RE.match(room_name)
    if not match:
        raise ValidationError({"room": ["Unable to resolve LiveKit stream from room name."]})

    stream_id = int(match.group("stream_id"))
    return LiveStream.objects.select_related("auction", "streamer", "thumbnail", "auction__item").get(pk=stream_id)


def _participant_metadata(participant: dict) -> dict:
    metadata = _parse_json_payload(participant.get("metadata"))
    if metadata:
        return metadata
    attributes = participant.get("attributes")
    if isinstance(attributes, dict):
        return attributes
    return {}


def _participant_identity(participant: dict) -> str:
    return str(participant.get("identity") or "")


def _participant_name(participant: dict) -> str:
    return str(participant.get("name") or "")


def _is_broadcaster(metadata: dict, identity: str = "") -> bool:
    role = str(metadata.get("role") or "").lower()
    if role in {"broadcaster", "moderator"}:
        return True
    if identity and str(identity).lower().startswith(("broadcaster-", "moderator-")):
        return True
    return False


def _find_user(participant: dict, metadata: dict) -> User | None:
    user_id = metadata.get("user_id")
    if not user_id:
        identity = _participant_identity(participant)
        match = re.match(r"^(?:viewer|broadcaster|moderator)-\d+-(\d+)$", identity)
        if match:
            user_id = match.group(1)
    if not user_id:
        return None
    try:
        return User.objects.get(pk=int(user_id))
    except User.DoesNotExist:
        return None


def _set_stream_live(*, stream: LiveStream) -> None:
    updates = []
    if stream.status == LiveStreamStatus.READY:
        stream.status = LiveStreamStatus.LIVE
        updates.append("status")
    if not stream.is_live:
        stream.is_live = True
        updates.append("is_live")
    if not stream.started_at:
        stream.started_at = timezone.now()
        updates.append("started_at")
    if updates:
        stream.save(update_fields=[*updates, "updated_at"])

    from apps.auctions.models import AuctionStatus
    auction = stream.auction
    auction.refresh_from_db(fields=["status", "start_time"])
    status_changed = False
    if auction.status in (AuctionStatus.ACTIVE, AuctionStatus.SCHEDULED):
        auction.status = AuctionStatus.LIVE
        if auction.start_time and auction.start_time > timezone.now():
            auction.start_time = timezone.now()
        auction.save(update_fields=["status", "start_time", "updated_at"])
        status_changed = True

    from apps.auctions.events import AUCTION_UPDATED, STREAM_STARTED
    from apps.auctions.services.realtime_service import (
        publish_auction_event,
        publish_auction_snapshot,
        build_auction_snapshot,
    )
    from apps.auctions.services.stream_service import (
        publish_stream_event,
        notify_auction_watchers,
        notify_user,
    )
    from apps.notifications.models import NotificationType

    if status_changed:
        publish_auction_event(
            auction_id=auction.id,
            event_type=AUCTION_UPDATED,
            payload={"auction_id": auction.id, "status": auction.status},
        )
        publish_auction_snapshot(
            auction_id=auction.id,
            snapshot=build_auction_snapshot(auction=auction),
            broadcast=True,
        )

    publish_stream_event(
        stream=stream,
        event_type=STREAM_STARTED,
        payload={"stream_id": stream.id, "auction_id": stream.auction_id},
    )

    notify_auction_watchers(
        auction=stream.auction,
        notification_type=NotificationType.STREAM_STARTED,
        title="Live stream started",
        content=f"Stream {stream.id} for auction {stream.auction_id} is now live.",
        exclude_user_ids=[stream.streamer_id] if stream.streamer_id else [],
    )
    if stream.streamer:
        notify_user(
            user=stream.streamer,
            notification_type=NotificationType.STREAM_STARTED,
            title="Your stream is live",
            content=f"Stream {stream.id} for auction {stream.auction_id} started.",
        )


def _update_stream_meta(*, stream: LiveStream, event_name: str, extra: dict | None = None) -> None:
    stream_meta = dict(stream.stream_meta or {})
    livekit_meta = dict(stream_meta.get("livekit") or {})
    livekit_meta["last_webhook_event"] = event_name
    if extra:
        livekit_meta.update(extra)
    stream_meta["livekit"] = livekit_meta
    stream.stream_meta = stream_meta
    stream.save(update_fields=["stream_meta", "updated_at"])


@transaction.atomic
def process_livekit_webhook_event(*, payload: dict) -> dict:
    event_name = str(payload.get("event") or "")
    event_id = str(payload.get("id") or "")
    room = payload.get("room") or {}
    participant = payload.get("participant") or {}
    track = payload.get("track") or {}

    if event_name not in LIVEKIT_WEBHOOK_EVENTS:
        return {"ignored": True, "event": event_name}

    stream = _resolve_stream_from_room(room=room)
    room_name = str(room.get("name") or "")
    room_metadata = _parse_json_payload(room.get("metadata"))
    participant_metadata = _participant_metadata(participant)
    user = _find_user(participant, participant_metadata)
    participant_identity = _participant_identity(participant)
    participant_name = _participant_name(participant)
    role = str(participant_metadata.get("role") or "viewer").lower()

    _update_stream_meta(
        stream=stream,
        event_name=event_name,
        extra={
            "room_name": room_name,
            "room_metadata": room_metadata,
            "participant_identity": participant_identity,
            "participant_name": participant_name,
            "participant_role": role,
            "track_event": track if track else None,
        },
    )

    if event_name == "room_started":
        _set_stream_live(stream=stream)
        track_event(
            user=user or stream.streamer,
            event_type="stream.livekit_room_started",
            metadata={"stream_id": stream.id, "auction_id": stream.auction_id, "room_name": room_name},
        )
        return {"event": event_name, "stream_id": stream.id, "auction_id": stream.auction_id}

    if event_name == "room_finished":
        end_stream(actor=None, stream=stream, reason="livekit_room_finished", status=LiveStreamStatus.ENDED)
        track_event(
            user=user or stream.streamer,
            event_type="stream.livekit_room_finished",
            metadata={"stream_id": stream.id, "auction_id": stream.auction_id, "room_name": room_name},
        )
        return {"event": event_name, "stream_id": stream.id, "auction_id": stream.auction_id}

    is_broadcaster = _is_broadcaster(participant_metadata, participant_identity)

    if event_name == "participant_joined":
        if is_broadcaster:
            _set_stream_live(stream=stream)
            track_event(
                user=user or stream.streamer,
                event_type="stream.livekit_broadcaster_joined",
                metadata={"stream_id": stream.id, "auction_id": stream.auction_id, "room_name": room_name},
            )
        elif user is not None:
            join_stream(
                stream=stream,
                viewer=user,
                metadata={
                    "source": "livekit_webhook",
                    "room_name": room_name,
                    "participant_identity": participant_identity,
                    "participant_name": participant_name,
                    "event_id": event_id,
                },
            )
        else:
            current_count = max(0, int(stream.viewer_count or 0)) + 1
            stream.viewer_count = current_count
            stream.save(update_fields=["viewer_count", "updated_at"])
            set_stream_presence_count(stream_id=stream.id, value=current_count)
        return {"event": event_name, "stream_id": stream.id, "auction_id": stream.auction_id}

    if event_name == "participant_left":
        if is_broadcaster:
            end_stream(actor=None, stream=stream, reason="livekit_broadcaster_left", status=LiveStreamStatus.ENDED)
        elif user is not None:
            leave_stream(
                stream=stream,
                viewer=user,
                metadata={
                    "source": "livekit_webhook",
                    "room_name": room_name,
                    "participant_identity": participant_identity,
                    "participant_name": participant_name,
                    "event_id": event_id,
                },
            )
        else:
            stream.viewer_count = max(0, int(stream.viewer_count or 0) - 1)
            stream.save(update_fields=["viewer_count", "updated_at"])
            set_stream_presence_count(stream_id=stream.id, value=stream.viewer_count)
        return {"event": event_name, "stream_id": stream.id, "auction_id": stream.auction_id}

    if event_name in {"track_published", "track_unpublished", "participant_connection_aborted"}:
        if event_name == "track_published" and is_broadcaster:
            _set_stream_live(stream=stream)
        track_event(
            user=user or stream.streamer,
            event_type=f"stream.livekit_{event_name}",
            metadata={
                "stream_id": stream.id,
                "auction_id": stream.auction_id,
                "room_name": room_name,
                "participant_identity": participant_identity,
                "participant_name": participant_name,
                "track_sid": track.get("sid"),
                "track_type": track.get("type"),
            },
        )
        return {"event": event_name, "stream_id": stream.id, "auction_id": stream.auction_id}

    return {"ignored": True, "event": event_name}
