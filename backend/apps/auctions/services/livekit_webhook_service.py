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


def _parse_authorization_header(authorization: str) -> str:
    if not authorization:
        raise PermissionDenied("Missing LiveKit webhook authorization.")
    prefix = "bearer "
    if not authorization.lower().startswith(prefix):
        raise PermissionDenied("Invalid LiveKit webhook authorization.")
    return authorization[len(prefix) :].strip()


def verify_livekit_webhook(*, body: str, authorization: str) -> dict:
    token = _parse_authorization_header(authorization)
    try:
        claims = jwt.decode(
            token,
            key=getattr(settings, "LIVEKIT_API_SECRET", ""),
            issuer=getattr(settings, "LIVEKIT_API_KEY", ""),
            algorithms=["HS256"],
        )
    except Exception as exc:
        raise PermissionDenied("Invalid LiveKit webhook signature.") from exc

    sha256_b64 = claims.get("sha256")
    if not sha256_b64:
        raise PermissionDenied("LiveKit webhook hash is missing.")
    try:
        expected_hash = base64.b64decode(sha256_b64)
    except Exception as exc:
        raise PermissionDenied("Invalid LiveKit webhook hash.") from exc

    actual_hash = hashlib.sha256(body.encode("utf-8")).digest()
    if actual_hash != expected_hash:
        raise PermissionDenied("LiveKit webhook payload hash mismatch.")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
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


def _is_broadcaster(metadata: dict) -> bool:
    return str(metadata.get("role") or "").lower() in {"broadcaster", "moderator"}


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
    auction.refresh_from_db(fields=["status"])
    if auction.status == AuctionStatus.ACTIVE:
        auction.status = AuctionStatus.LIVE
        auction.save(update_fields=["status", "updated_at"])


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

    if event_name == "participant_joined":
        if _is_broadcaster(participant_metadata):
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
        if _is_broadcaster(participant_metadata):
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
