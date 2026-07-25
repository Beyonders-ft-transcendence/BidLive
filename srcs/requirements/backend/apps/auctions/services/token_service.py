from __future__ import annotations

import logging
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.utils import timezone

from apps.analytics.services import track_event
from apps.auctions.events import LIVEKIT_TOKEN_ISSUED
from apps.auctions.models import LiveStream, LiveStreamStatus, LiveStreamVisibility
from apps.auctions.services.participant_service import (
    can_moderate_room,
    can_publish_data,
    can_publish_tracks,
    can_subscribe_tracks,
    build_livekit_participant_identity,
    build_livekit_participant_name,
    resolve_livekit_role,
)
from apps.auctions.services.livekit_client import build_livekit_participant_token
from apps.auctions.services.room_service import (
    build_livekit_room_metadata,
    build_livekit_room_name,
    ensure_livekit_room,
    get_livekit_public_url,
)
from apps.auctions.services.stream_service import publish_stream_event
from apps.users.authorization_service import user_has_permission

logger = logging.getLogger(__name__)


def _assert_livekit_configured() -> None:
    if not getattr(settings, "LIVEKIT_API_KEY", "") or not getattr(settings, "LIVEKIT_API_SECRET", ""):
        raise PermissionDenied("LiveKit is not configured.")


def _can_manage_stream(*, user, stream: LiveStream) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if stream.auction.item.seller_id == user.id:
        return True
    if stream.streamer_id == user.id:
        return True
    if user_has_permission(user=user, permission_name="auction.manage"):
        return True
    return bool(user.has_role("admin"))


def _assert_viewer_access(*, user, stream: LiveStream) -> None:
    if stream.status != LiveStreamStatus.LIVE:
        raise PermissionDenied("The stream is not live yet.")
    if not user_has_permission(user=user, permission_name="auction.read") and not _can_manage_stream(
        user=user, stream=stream
    ):
        raise PermissionDenied("You are not allowed to view this stream.")
    if stream.visibility == LiveStreamVisibility.PRIVATE and not _can_manage_stream(user=user, stream=stream):
        raise PermissionDenied("This stream is private.")


def _assert_broadcaster_access(*, user, stream: LiveStream) -> None:
    if stream.status in (LiveStreamStatus.ENDED, LiveStreamStatus.CANCELLED):
        raise PermissionDenied("The stream is already closed.")
    if not _can_manage_stream(user=user, stream=stream):
        raise PermissionDenied("You are not allowed to publish this stream.")


def issue_livekit_stream_token(
    *,
    stream: LiveStream,
    user,
    requested_role: str = "viewer",
    participant_name: str = "",
    metadata: dict | None = None,
) -> dict:
    _assert_livekit_configured()
    role = resolve_livekit_role(stream=stream, user=user, requested_role=requested_role)

    if role == "viewer":
        _assert_viewer_access(user=user, stream=stream)
    else:
        _assert_broadcaster_access(user=user, stream=stream)

    room_name = build_livekit_room_name(stream=stream)

    try:
        ensure_livekit_room(stream=stream)
    except Exception as exc:
        logger.warning(
            "Failed to ensure LiveKit room for stream %s (token will still be issued): %s",
            stream.id,
            exc,
        )

    identity = build_livekit_participant_identity(stream=stream, user=user, role=role)
    name = participant_name.strip() or build_livekit_participant_name(user=user, role=role)
    claims_metadata = {
        "stream_id": stream.id,
        "auction_id": stream.auction_id,
        "user_id": user.id,
        "role": role,
        **build_livekit_room_metadata(stream=stream),
        **(metadata or {}),
    }
    ttl_minutes = int(getattr(settings, "LIVEKIT_TOKEN_TTL_MINUTES", 60))
    token = build_livekit_participant_token(
        identity=identity,
        name=name,
        metadata=claims_metadata,
        grants={
            "roomJoin": True,
            "room": room_name,
            "canPublish": can_publish_tracks(role=role),
            "canSubscribe": can_subscribe_tracks(role=role),
            "canPublishData": can_publish_data(role=role),
            "canUpdateOwnMetadata": True,
            "roomAdmin": can_moderate_room(role=role),
        },
        ttl_minutes=ttl_minutes,
    )
    expires_at = timezone.now() + timedelta(minutes=ttl_minutes)

    publish_stream_event(
        stream=stream,
        event_type=LIVEKIT_TOKEN_ISSUED,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "role": role,
            "room_name": room_name,
            "identity": identity,
        },
    )
    track_event(
        user=user,
        event_type="stream.livekit_token_issued",
        metadata={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "role": role,
            "room_name": room_name,
        },
    )

    return {
        "token": token,
        "room_name": room_name,
        "url": get_livekit_public_url(),
        "identity": identity,
        "name": name,
        "role": role,
        "can_publish": can_publish_tracks(role=role),
        "can_subscribe": can_subscribe_tracks(role=role),
        "expires_at": expires_at,
        "stream_id": stream.id,
        "auction_id": stream.auction_id,
    }
