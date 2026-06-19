from django.core.exceptions import PermissionDenied

from apps.auctions.models import LiveStream
from apps.users.authorization_service import user_has_permission

LIVEKIT_ROLE_BROADCASTER = "broadcaster"
LIVEKIT_ROLE_VIEWER = "viewer"
LIVEKIT_ROLE_MODERATOR = "moderator"

LIVEKIT_ROLE_CHOICES = {
    LIVEKIT_ROLE_BROADCASTER,
    LIVEKIT_ROLE_VIEWER,
    LIVEKIT_ROLE_MODERATOR,
}


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


def resolve_livekit_role(*, stream: LiveStream, user, requested_role: str) -> str:
    role = (requested_role or LIVEKIT_ROLE_VIEWER).strip().lower()
    if role not in LIVEKIT_ROLE_CHOICES:
        raise PermissionDenied("Invalid LiveKit role.")

    if role in {LIVEKIT_ROLE_BROADCASTER, LIVEKIT_ROLE_MODERATOR} and not _can_manage_stream(
        user=user, stream=stream
    ):
        raise PermissionDenied("You are not allowed to publish this stream.")

    if role == LIVEKIT_ROLE_VIEWER:
        if not user_has_permission(user=user, permission_name="auction.read") and not _can_manage_stream(
            user=user, stream=stream
        ):
            raise PermissionDenied("You are not allowed to view this stream.")

    return role


def build_livekit_participant_identity(*, stream: LiveStream, user, role: str) -> str:
    return f"{role}-{stream.id}-{user.id}"


def build_livekit_participant_name(*, user, role: str) -> str:
    full_name = getattr(user, "full_name", "") or ""
    label = full_name.strip() or getattr(user, "username", "") or f"user-{user.id}"
    return f"{label} ({role})"


def can_publish_tracks(*, role: str) -> bool:
    return role in {LIVEKIT_ROLE_BROADCASTER, LIVEKIT_ROLE_MODERATOR}


def can_subscribe_tracks(*, role: str) -> bool:
    return True


def can_publish_data(*, role: str) -> bool:
    return True


def can_moderate_room(*, role: str) -> bool:
    return role in {LIVEKIT_ROLE_BROADCASTER, LIVEKIT_ROLE_MODERATOR}
