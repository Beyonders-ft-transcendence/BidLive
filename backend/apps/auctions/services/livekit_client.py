from __future__ import annotations

import base64
import json
import hashlib
import time
from datetime import timedelta
from typing import Any
from urllib.parse import urljoin

import jwt
import requests
from django.conf import settings
from rest_framework.exceptions import ValidationError


class LiveKitServiceError(RuntimeError):
    pass


def get_livekit_server_url() -> str:
    return str(getattr(settings, "LIVEKIT_URL", "") or "").rstrip("/")


def get_livekit_public_url() -> str:
    return str(getattr(settings, "LIVEKIT_PUBLIC_URL", "") or get_livekit_server_url()).rstrip("/")


def _assert_configured() -> None:
    if not getattr(settings, "LIVEKIT_API_KEY", "") or not getattr(settings, "LIVEKIT_API_SECRET", ""):
        raise ValidationError({"livekit": ["LiveKit is not configured."]})
    if not get_livekit_server_url():
        raise ValidationError({"livekit": ["LiveKit URL is not configured."]})


def _now_timestamp() -> int:
    return int(time.time())


def build_livekit_token(
    *,
    subject: str,
    claims: dict[str, Any],
    name: str = "",
    metadata: dict[str, Any] | str | None = None,
    ttl_minutes: int = 60,
) -> str:
    _assert_configured()
    issued_at = _now_timestamp()
    payload: dict[str, Any] = {
        "iss": settings.LIVEKIT_API_KEY,
        "sub": subject,
        "iat": issued_at,
        "nbf": issued_at - 10,
        "exp": issued_at + int(timedelta(minutes=ttl_minutes).total_seconds()),
    }
    if name:
        payload["name"] = name
    if metadata is not None:
        payload["metadata"] = metadata if isinstance(metadata, str) else json.dumps(metadata, separators=(",", ":"))
    payload.update(claims)
    token = jwt.encode(payload, settings.LIVEKIT_API_SECRET, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token


def build_livekit_server_token(*, grants: dict[str, Any], ttl_minutes: int = 10) -> str:
    return build_livekit_token(subject="bidlive-backend", claims={"video": grants}, ttl_minutes=ttl_minutes)


def build_livekit_participant_token(
    *,
    identity: str,
    name: str,
    metadata: dict[str, Any],
    grants: dict[str, Any],
    ttl_minutes: int,
) -> str:
    return build_livekit_token(
        subject=identity,
        name=name,
        metadata=metadata,
        claims={"video": grants, "jti": hashlib.sha256(f"{identity}:{_now_timestamp()}".encode()).hexdigest()},
        ttl_minutes=ttl_minutes,
    )


def _twirp_url(method: str) -> str:
    return urljoin(f"{get_livekit_server_url().rstrip('/')}/", f"twirp/livekit.RoomService/{method}")


def _request_twirp(method: str, payload: dict[str, Any], *, grants: dict[str, Any], timeout: int = 10) -> dict[str, Any]:
    _assert_configured()
    response = requests.post(
        _twirp_url(method),
        json=payload,
        headers={
            "Authorization": f"Bearer {build_livekit_server_token(grants=grants)}",
            "Content-Type": "application/json",
        },
        timeout=timeout,
    )
    if response.ok:
        if not response.content:
            return {}
        data = response.json()
        return data if isinstance(data, dict) else {"data": data}

    error_code = None
    error_message = response.text.strip()
    try:
        error_payload = response.json()
        if isinstance(error_payload, dict):
            error_code = error_payload.get("code")
            error_message = error_payload.get("msg") or error_payload.get("message") or error_message
    except Exception:
        pass
    raise LiveKitServiceError(f"{method} failed ({error_code or response.status_code}): {error_message}")


def list_rooms(*, room_name: str) -> list[dict[str, Any]]:
    response = _request_twirp(
        "ListRooms",
        {"names": [room_name]},
        grants={"roomList": True},
    )
    rooms = response.get("rooms")
    if isinstance(rooms, list):
        return rooms
    if isinstance(response, list):
        return response
    return []


def create_room(*, room_name: str, metadata: str, empty_timeout: int = 300, departure_timeout: int = 20) -> dict[str, Any]:
    return _request_twirp(
        "CreateRoom",
        {
            "name": room_name,
            "metadata": metadata,
            "empty_timeout": empty_timeout,
            "departure_timeout": departure_timeout,
        },
        grants={"roomCreate": True},
    )


def update_room_metadata(*, room_name: str, metadata: str) -> dict[str, Any]:
    return _request_twirp(
        "UpdateRoomMetadata",
        {
            "room": room_name,
            "metadata": metadata,
        },
        grants={"roomAdmin": True, "room": room_name},
    )


def delete_room(*, room_name: str) -> None:
    try:
        _request_twirp(
            "DeleteRoom",
            {"room": room_name},
            grants={"roomCreate": True},
        )
    except LiveKitServiceError as exc:
        if "not_found" in str(exc).lower():
            return
        raise
