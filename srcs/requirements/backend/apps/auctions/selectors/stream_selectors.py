from django.db.models import QuerySet

from apps.auctions.models import Auction, LiveStream, StreamViewer, LiveStreamStatus


def list_streams_for_auction(*, auction_id: int) -> QuerySet[LiveStream]:
    return (
        LiveStream.objects.filter(auction_id=auction_id)
        .select_related("auction", "streamer", "thumbnail", "auction__item")
        .order_by("-created_at")
    )


def get_stream_for_auction(*, auction_id: int, stream_id: int) -> LiveStream:
    return list_streams_for_auction(auction_id=auction_id).get(pk=stream_id)


def get_active_stream_for_auction(*, auction_id: int) -> LiveStream | None:
    return (
        list_streams_for_auction(auction_id=auction_id)
        .filter(status__in=[LiveStreamStatus.READY, LiveStreamStatus.LIVE])
        .order_by("-created_at")
        .first()
    )


def list_viewers_for_stream(*, stream_id: int) -> QuerySet[StreamViewer]:
    return StreamViewer.objects.filter(stream_id=stream_id).select_related("viewer").order_by("-joined_at")


def get_stream_viewer_count(*, stream_id: int) -> int:
    return StreamViewer.objects.filter(stream_id=stream_id).count()


def list_active_streams_for_auction(*, auction_id: int) -> QuerySet[LiveStream]:
    return list_streams_for_auction(auction_id=auction_id).filter(status=LiveStreamStatus.LIVE)
