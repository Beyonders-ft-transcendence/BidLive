import json

from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.auctions.models import LiveStream
from apps.auctions.services.livekit_client import (
    LiveKitServiceError,
    create_room as livekit_create_room,
    delete_room as livekit_delete_room,
    list_rooms as livekit_list_rooms,
    update_room_metadata as livekit_update_room_metadata,
)


def build_livekit_room_name(*, stream: LiveStream) -> str:
    return f"auction-{stream.auction_id}-stream-{stream.id}"


def build_livekit_room_metadata(*, stream: LiveStream) -> dict:
    return {
        "auction_id": stream.auction_id,
        "stream_id": stream.id,
        "streamer_id": stream.streamer_id,
        "visibility": stream.visibility,
        "status": stream.status,
        "title": stream.title,
    }


def get_livekit_server_url() -> str:
    return getattr(settings, "LIVEKIT_URL", "")


def get_livekit_public_url() -> str:
    return getattr(settings, "LIVEKIT_PUBLIC_URL", get_livekit_server_url())


def ensure_livekit_room(*, stream: LiveStream) -> dict:
    try:
        room_name = build_livekit_room_name(stream=stream)
        metadata = json.dumps(build_livekit_room_metadata(stream=stream), separators=(",", ":"))
        rooms = livekit_list_rooms(room_name=room_name)
        if rooms:
            room = rooms[0]
            if str(room.get("metadata") or "") != metadata:
                room = livekit_update_room_metadata(room_name=room_name, metadata=metadata)
        else:
            room = livekit_create_room(room_name=room_name, metadata=metadata)
    except LiveKitServiceError as exc:
        raise ValidationError({"livekit": [str(exc)]}) from exc

    return room


def remove_livekit_room(*, stream: LiveStream) -> None:
    room_name = build_livekit_room_name(stream=stream)
    try:
        livekit_delete_room(room_name=room_name)
    except LiveKitServiceError as exc:
        if "not_found" in str(exc).lower():
            return
        raise ValidationError({"livekit": [str(exc)]}) from exc
