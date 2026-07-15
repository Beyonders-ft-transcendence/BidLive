from django.core.cache import cache

from apps.auctions.models import LiveStream, StreamViewer
from apps.auctions.selectors import list_viewers_for_stream


def _presence_key(*, stream_id: int) -> str:
    return f"stream:{stream_id}:presence"


def get_stream_presence_count(*, stream_id: int) -> int:
    return max(0, int(cache.get(_presence_key(stream_id=stream_id), 0) or 0))


def set_stream_presence_count(*, stream_id: int, value: int) -> int:
    value = max(0, int(value))
    if value == 0:
        cache.delete(_presence_key(stream_id=stream_id))
    else:
        cache.set(_presence_key(stream_id=stream_id), value, timeout=None)
    return value


def build_stream_presence_snapshot(*, stream: LiveStream) -> dict:
    viewers = list_viewers_for_stream(stream_id=stream.id)
    return {
        "stream_id": stream.id,
        "auction_id": stream.auction_id,
        "viewer_count": get_stream_presence_count(stream_id=stream.id) or stream.viewer_count,
        "known_viewers": viewers.count(),
    }


def list_stream_viewers(*, stream_id: int):
    return list_viewers_for_stream(stream_id=stream_id)


def record_viewer_join(*, stream: LiveStream, viewer) -> StreamViewer:
    stream_viewer, _ = StreamViewer.objects.get_or_create(stream=stream, viewer=viewer)
    return stream_viewer


def record_viewer_leave(*, stream: LiveStream, viewer) -> int:
    deleted, _ = StreamViewer.objects.filter(stream=stream, viewer=viewer).delete()
    return deleted
