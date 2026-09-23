from __future__ import annotations

import hashlib
import secrets
from datetime import datetime
from decimal import Decimal

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.analytics.services import track_event
from apps.auctions.events import (
    LIVEKIT_ROOM_CLOSED,
    LIVEKIT_ROOM_READY,
    STREAM_CANCELLED,
    STREAM_CREATED,
    STREAM_ENDED,
    STREAM_KEY_ROTATED,
    STREAM_STARTED,
    STREAM_UPDATED,
    VIEWER_COUNT_UPDATED,
    VIEWER_JOINED,
    VIEWER_LEFT,
)
from apps.auctions.models import (
    Auction,
    AuctionStatus,
    LiveStream,
    LiveStreamStatus,
    LiveStreamVisibility,
    StreamViewer,
)
from apps.auctions.selectors import list_streams_for_auction
from apps.auctions.services.room_service import (
    build_livekit_room_metadata,
    build_livekit_room_name,
    ensure_livekit_room,
    remove_livekit_room,
)
from apps.auctions.services.realtime_service import auction_group_name
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_auction_watchers, notify_user
from apps.users.authorization_service import log_permission_audit, user_has_permission


def _stream_presence_key(*, stream_id: int) -> str:
    return f"stream:{stream_id}:presence"


def _stream_group_name(*, stream_id: int) -> str:
    return f"stream_{stream_id}"


def _stream_key_digest(stream_key: str) -> str:
    return hashlib.sha256(stream_key.encode("utf-8")).hexdigest()


def _normalize_payload(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: _normalize_payload(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_normalize_payload(item) for item in value]
    return value


def _client_ip_from_metadata(metadata: dict | None) -> str:
    metadata = metadata or {}
    return str(metadata.get("ip_address") or "")


def _can_manage_auction(*, user, auction: Auction) -> bool:
    if not user or not user.is_authenticated:
        return False
    if auction.item.seller_id == user.id:
        return True
    if user_has_permission(user=user, permission_name="auction.manage"):
        return True
    if getattr(user, "is_superuser", False):
        return True
    return bool(user.has_role("SUPER_ADMIN") or user.has_role("MONITOR") or user.has_role("admin"))


def _ensure_can_manage_auction(*, user, auction: Auction) -> None:
    if not _can_manage_auction(user=user, auction=auction):
        raise PermissionDenied({"permission": ["Not allowed to manage this auction stream."]})


def _ensure_auction_streamable(*, auction: Auction) -> None:
    if auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
        raise ValidationError({"auction": ["Auction is already closed."]})
    if auction.end_time and auction.end_time <= timezone.now():
        raise ValidationError({"auction": ["Auction has already ended."]})


def _validate_stream_key(stream: LiveStream, stream_key: str) -> bool:
    if not stream_key:
        return False
    expected_hash = stream.stream_key_hash or _stream_key_digest(stream.stream_key)
    return secrets.compare_digest(expected_hash, _stream_key_digest(stream_key))


def generate_stream_key() -> str:
    return f"sk_live_{secrets.token_hex(16)}"


def get_stream_presence(*, stream_id: int) -> int:
    return max(0, int(cache.get(_stream_presence_key(stream_id=stream_id), 0) or 0))


def increment_stream_presence(*, stream_id: int) -> int:
    cache_key = _stream_presence_key(stream_id=stream_id)
    if cache.add(cache_key, 1, timeout=None):
        return 1
    try:
        return max(0, int(cache.incr(cache_key)))
    except ValueError:
        cache.set(cache_key, 1, timeout=None)
        return 1


def decrement_stream_presence(*, stream_id: int) -> int:
    cache_key = _stream_presence_key(stream_id=stream_id)
    current = int(cache.get(cache_key, 0) or 0)
    if current <= 1:
        cache.delete(cache_key)
        return 0
    try:
        return max(0, int(cache.decr(cache_key)))
    except ValueError:
        cache.delete(cache_key)
        return 0


def build_stream_snapshot(*, stream: LiveStream) -> dict:
    stream.refresh_from_db(fields=["viewer_count", "is_live", "status", "started_at", "ended_at"])
    return {
        "stream_id": stream.id,
        "auction_id": stream.auction_id,
        "streamer_id": stream.streamer_id,
        "status": stream.status,
        "visibility": stream.visibility,
        "title": stream.title,
        "description": stream.description,
        "is_live": stream.is_live,
        "viewer_count": get_stream_presence(stream_id=stream.id) or stream.viewer_count,
        "started_at": stream.started_at,
        "ended_at": stream.ended_at,
        "thumbnail": stream.thumbnail_id,
        "stream_meta": stream.stream_meta or {},
    }


def publish_stream_event(*, stream: LiveStream, event_type: str, payload: dict) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    normalized = _normalize_payload(payload)
    async_to_sync(channel_layer.group_send)(
        _stream_group_name(stream_id=stream.id),
        {
            "type": "stream.event",
            "event": event_type,
            "payload": normalized,
        },
    )
    if stream.auction_id:
        async_to_sync(channel_layer.group_send)(
            auction_group_name(auction_id=stream.auction_id),
            {
                "type": "auction.event",
                "event": event_type,
                "payload": normalized,
            },
        )


def publish_viewer_count(*, stream: LiveStream) -> None:
    publish_stream_event(
        stream=stream,
        event_type=VIEWER_COUNT_UPDATED,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "viewer_count": get_stream_presence(stream_id=stream.id),
        },
    )


@transaction.atomic
def create_stream(
    *,
    actor,
    auction: Auction,
    data: dict,
    ip_address: str = "",
) -> LiveStream:
    _ensure_can_manage_auction(user=actor, auction=auction)
    _ensure_auction_streamable(auction=auction)
    if list_streams_for_auction(auction_id=auction.id).filter(
        status__in=[LiveStreamStatus.DRAFT, LiveStreamStatus.READY, LiveStreamStatus.LIVE]
    ).exists():
        raise ValidationError({"auction": ["Auction already has an open stream."]})

    stream_key = generate_stream_key()
    stream = LiveStream.objects.create(
        auction=auction,
        streamer=actor,
        stream_key=stream_key,
        stream_key_hash=_stream_key_digest(stream_key),
        title=data.get("title", ""),
        description=data.get("description", ""),
        thumbnail=data.get("thumbnail"),
        status=LiveStreamStatus.DRAFT if data.get("status") == LiveStreamStatus.DRAFT else LiveStreamStatus.READY,
        visibility=data.get("visibility") or LiveStreamVisibility.PUBLIC,
        is_live=False,
        stream_meta=data.get("stream_meta") or {},
    )
    stream_meta = dict(stream.stream_meta or {})
    stream_meta["livekit"] = {
        **build_livekit_room_metadata(stream=stream),
        "room_name": build_livekit_room_name(stream=stream),
    }
    stream.stream_meta = stream_meta
    stream.save(update_fields=["stream_meta", "updated_at"])
    room = ensure_livekit_room(stream=stream)
    stream_meta["livekit"].update(
        {
            "room_sid": room.get("sid"),
            "room_metadata": room.get("metadata"),
        }
    )
    stream.stream_meta = stream_meta
    stream.save(update_fields=["stream_meta", "updated_at"])

    log_permission_audit(
        actor=actor,
        action="stream.create",
        resource_type="live_stream",
        resource_id=stream.id,
        metadata={"auction_id": auction.id},
        ip_address=ip_address,
    )
    track_event(
        user=actor,
        event_type="stream.created",
        metadata={"stream_id": stream.id, "auction_id": auction.id},
        ip_address=ip_address,
    )
    publish_stream_event(
        stream=stream,
        event_type=STREAM_CREATED,
        payload=build_stream_snapshot(stream=stream),
    )
    return stream


@transaction.atomic
def update_stream(
    *,
    actor,
    stream: LiveStream,
    data: dict,
    ip_address: str = "",
) -> LiveStream:
    _ensure_can_manage_auction(user=actor, auction=stream.auction)
    if stream.status in (LiveStreamStatus.ENDED, LiveStreamStatus.CANCELLED):
        raise ValidationError({"status": ["Stream is already closed."]})

    for field in ("title", "description", "visibility", "stream_meta"):
        if field in data:
            setattr(stream, field, data.get(field))
    if "thumbnail" in data:
        stream.thumbnail = data.get("thumbnail")

    stream.save()
    log_permission_audit(
        actor=actor,
        action="stream.update",
        resource_type="live_stream",
        resource_id=stream.id,
        metadata={"auction_id": stream.auction_id, "fields": list(data.keys())},
        ip_address=ip_address,
    )
    track_event(
        user=actor,
        event_type="stream.updated",
        metadata={"stream_id": stream.id, "auction_id": stream.auction_id, "fields": list(data.keys())},
        ip_address=ip_address,
    )
    publish_stream_event(
        stream=stream,
        event_type=STREAM_UPDATED,
        payload=build_stream_snapshot(stream=stream),
    )
    return stream


@transaction.atomic
def regenerate_stream_key(*, actor, stream: LiveStream, ip_address: str = "") -> LiveStream:
    _ensure_can_manage_auction(user=actor, auction=stream.auction)
    new_key = generate_stream_key()
    stream.stream_key = new_key
    stream.stream_key_hash = _stream_key_digest(new_key)
    stream.save(update_fields=["stream_key", "stream_key_hash", "updated_at"])

    log_permission_audit(
        actor=actor,
        action="stream.regenerate_key",
        resource_type="live_stream",
        resource_id=stream.id,
        metadata={"auction_id": stream.auction_id},
        ip_address=ip_address,
    )
    track_event(
        user=actor,
        event_type="stream.key_rotated",
        metadata={"stream_id": stream.id, "auction_id": stream.auction_id},
        ip_address=ip_address,
    )
    publish_stream_event(
        stream=stream,
        event_type=STREAM_KEY_ROTATED,
        payload={"stream_id": stream.id, "auction_id": stream.auction_id},
    )
    return stream


@transaction.atomic
def start_stream(
    *,
    actor,
    stream: LiveStream,
    stream_key: str = "",
    ip_address: str = "",
    metadata: dict | None = None,
) -> LiveStream:
    metadata = metadata or {}
    _ensure_can_manage_auction(user=actor, auction=stream.auction)
    if stream.status in (LiveStreamStatus.ENDED, LiveStreamStatus.CANCELLED):
        raise ValidationError({"status": ["Stream is already closed."]})
    if stream_key and not _validate_stream_key(stream, stream_key):
        raise ValidationError({"stream_key": ["Invalid stream key."]})
    if stream.auction.status in (AuctionStatus.ENDED, AuctionStatus.CANCELLED, AuctionStatus.SOLD):
        raise ValidationError({"auction": ["Auction is already closed."]})

    stream.status = LiveStreamStatus.LIVE
    stream.is_live = True
    stream.started_at = stream.started_at or timezone.now()
    stream.save(update_fields=["status", "is_live", "started_at", "updated_at"])

    auction = stream.auction
    auction.refresh_from_db(fields=["status", "started_at"])
    if auction.status in (AuctionStatus.ACTIVE, AuctionStatus.SCHEDULED):
        auction.status = AuctionStatus.LIVE
        if auction.start_time and auction.start_time > timezone.now():
            auction.start_time = timezone.now()
        auction.save(update_fields=["status", "start_time", "updated_at"])
        from apps.auctions.events import AUCTION_UPDATED
        from apps.auctions.services.realtime_service import publish_auction_event, publish_auction_snapshot, build_auction_snapshot
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

    ensure_livekit_room(stream=stream)

    notify_auction_watchers(
        auction=stream.auction,
        notification_type=NotificationType.STREAM_STARTED,
        title="Live stream started",
        content=f"Stream {stream.id} for auction {stream.auction_id} is now live.",
        exclude_user_ids=[actor.id] if actor else [],
    )
    notify_user(
        user=stream.streamer,
        notification_type=NotificationType.STREAM_STARTED,
        title="Your stream is live",
        content=f"Stream {stream.id} for auction {stream.auction_id} started.",
    )

    log_permission_audit(
        actor=actor,
        action="stream.start",
        resource_type="live_stream",
        resource_id=stream.id,
        metadata={"auction_id": stream.auction_id, **metadata},
        ip_address=ip_address,
    )
    track_event(
        user=actor,
        event_type="stream.started",
        metadata={"stream_id": stream.id, "auction_id": stream.auction_id, **metadata},
        ip_address=ip_address,
    )
    publish_stream_event(
        stream=stream,
        event_type=STREAM_STARTED,
        payload=build_stream_snapshot(stream=stream),
    )
    publish_stream_event(
        stream=stream,
        event_type=LIVEKIT_ROOM_READY,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "room_name": build_livekit_room_name(stream=stream),
        },
    )
    publish_viewer_count(stream=stream)
    return stream


@transaction.atomic
def end_stream(
    *,
    actor=None,
    stream: LiveStream,
    reason: str = "",
    status: str = LiveStreamStatus.ENDED,
    ip_address: str = "",
) -> LiveStream:
    if stream.status in (LiveStreamStatus.ENDED, LiveStreamStatus.CANCELLED):
        return stream

    stream.status = status
    stream.is_live = False
    stream.ended_at = timezone.now()
    stream.viewer_count = get_stream_presence(stream_id=stream.id)
    stream.save(update_fields=["status", "is_live", "ended_at", "viewer_count", "updated_at"])
    cache.delete(_stream_presence_key(stream_id=stream.id))
    StreamViewer.objects.filter(stream=stream).delete()
    try:
        remove_livekit_room(stream=stream)
    except ValidationError:
        pass

    auction = stream.auction
    auction.refresh_from_db(fields=["status", "started_at"])
    if auction.status == AuctionStatus.LIVE:
        has_other_live = list_streams_for_auction(auction_id=auction.id).filter(
            status=LiveStreamStatus.LIVE
        ).exclude(pk=stream.pk).exists()
        if not has_other_live:
            auction.status = AuctionStatus.ACTIVE
            auction.save(update_fields=["status", "updated_at"])

            from apps.auctions.events import AUCTION_UPDATED
            from apps.auctions.services.realtime_service import publish_auction_event, publish_auction_snapshot, build_auction_snapshot
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

    if actor and getattr(actor, "is_authenticated", False):
        log_permission_audit(
            actor=actor,
            action="stream.end",
            resource_type="live_stream",
            resource_id=stream.id,
            metadata={"auction_id": stream.auction_id, "reason": reason, "status": status},
            ip_address=ip_address,
        )
    track_user = actor if actor and getattr(actor, "is_authenticated", False) else stream.streamer
    if track_user:
        track_event(
            user=track_user,
            event_type="stream.ended",
            metadata={"stream_id": stream.id, "auction_id": stream.auction_id, "reason": reason, "status": status},
            ip_address=ip_address,
        )

    notification_type = NotificationType.STREAM_ENDED
    if status == LiveStreamStatus.CANCELLED:
        notification_type = NotificationType.STREAM_CANCELLED

    notify_auction_watchers(
        auction=stream.auction,
        notification_type=notification_type,
        title="Live stream ended",
        content=f"Stream {stream.id} for auction {stream.auction_id} ended.",
        exclude_user_ids=[stream.streamer_id],
    )
    notify_user(
        user=stream.streamer,
        notification_type=notification_type,
        title="Your stream ended",
        content=f"Stream {stream.id} for auction {stream.auction_id} ended.",
    )

    event_type = STREAM_ENDED if status != LiveStreamStatus.CANCELLED else STREAM_CANCELLED
    publish_stream_event(
        stream=stream,
        event_type=event_type,
        payload={"stream_id": stream.id, "auction_id": stream.auction_id, "reason": reason, "status": status},
    )
    publish_stream_event(
        stream=stream,
        event_type=LIVEKIT_ROOM_CLOSED,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "room_name": build_livekit_room_name(stream=stream),
            "reason": reason,
            "status": status,
        },
    )
    return stream


@transaction.atomic
def cancel_stream(*, actor, stream: LiveStream, reason: str = "", ip_address: str = "") -> LiveStream:
    return end_stream(actor=actor, stream=stream, reason=reason, status=LiveStreamStatus.CANCELLED, ip_address=ip_address)


@transaction.atomic
def join_stream(*, stream: LiveStream, viewer, metadata: dict | None = None) -> tuple[StreamViewer, int]:
    metadata = metadata or {}
    stream_viewer, created = StreamViewer.objects.get_or_create(stream=stream, viewer=viewer)
    if created:
        stream.viewer_count = increment_stream_presence(stream_id=stream.id)
    else:
        stream_viewer.save(update_fields=["last_seen_at"])
        stream.viewer_count = get_stream_presence(stream_id=stream.id)
    stream.save(update_fields=["viewer_count", "updated_at"])
    publish_stream_event(
        stream=stream,
        event_type=VIEWER_JOINED,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "viewer": {
                "id": viewer.id,
                "username": viewer.username,
                "full_name": getattr(viewer, "full_name", ""),
            },
            "viewer_count": stream.viewer_count,
            **metadata,
        },
    )
    publish_viewer_count(stream=stream)
    track_event(
        user=viewer,
        event_type="stream.viewer_joined",
        metadata={"stream_id": stream.id, "auction_id": stream.auction_id, **metadata},
    )
    return stream_viewer, stream.viewer_count


@transaction.atomic
def leave_stream(*, stream: LiveStream, viewer, metadata: dict | None = None) -> int:
    metadata = metadata or {}
    deleted, _ = StreamViewer.objects.filter(stream=stream, viewer=viewer).delete()
    if deleted:
        stream.viewer_count = decrement_stream_presence(stream_id=stream.id)
    else:
        stream.viewer_count = get_stream_presence(stream_id=stream.id)
    stream.save(update_fields=["viewer_count", "updated_at"])
    publish_stream_event(
        stream=stream,
        event_type=VIEWER_LEFT,
        payload={
            "stream_id": stream.id,
            "auction_id": stream.auction_id,
            "viewer": {
                "id": viewer.id,
                "username": viewer.username,
                "full_name": getattr(viewer, "full_name", ""),
            },
            "viewer_count": stream.viewer_count,
            **metadata,
        },
    )
    publish_viewer_count(stream=stream)
    track_event(
        user=viewer,
        event_type="stream.viewer_left",
        metadata={"stream_id": stream.id, "auction_id": stream.auction_id, **metadata},
    )
    return stream.viewer_count


def authenticate_stream_key(*, stream_key: str) -> LiveStream:
    try:
        stream = LiveStream.objects.select_related("auction", "streamer", "thumbnail", "auction__item").get(
            stream_key=stream_key
        )
    except LiveStream.DoesNotExist as exc:
        raise ValidationError({"stream_key": ["Invalid stream key."]}) from exc
    if not _validate_stream_key(stream, stream_key):
        raise ValidationError({"stream_key": ["Invalid stream key."]})
    if stream.status in (LiveStreamStatus.ENDED, LiveStreamStatus.CANCELLED):
        raise ValidationError({"stream_key": ["Stream is already closed."]})
    return stream


def get_stream_by_key(*, stream_key: str) -> LiveStream:
    return authenticate_stream_key(stream_key=stream_key)


def get_stream_snapshot(*, stream: LiveStream) -> dict:
    return build_stream_snapshot(stream=stream)


def end_active_streams_for_auction(*, auction_id: int, reason: str = "auction_closed") -> int:
    count = 0
    for stream in list_streams_for_auction(auction_id=auction_id).filter(
        status__in=[LiveStreamStatus.DRAFT, LiveStreamStatus.READY, LiveStreamStatus.LIVE]
    ):
        end_stream(stream=stream, reason=reason, status=LiveStreamStatus.ENDED)
        count += 1
    return count
