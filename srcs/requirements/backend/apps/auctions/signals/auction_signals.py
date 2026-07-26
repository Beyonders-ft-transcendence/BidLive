from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.auctions.events import AUCTION_ENDED, AUCTION_STARTED, AUCTION_UPDATED
from apps.auctions.models import Auction, AuctionStatus
from apps.auctions.services.realtime_service import build_auction_snapshot, publish_auction_event, publish_auction_snapshot
from apps.auctions.services.stream_service import end_active_streams_for_auction


@receiver(pre_save, sender=Auction)
def _capture_previous_status(sender, instance: Auction, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return
    previous = Auction.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    instance._previous_status = previous


@receiver(post_save, sender=Auction)
def _publish_status_changes(sender, instance: Auction, **kwargs):
    previous = getattr(instance, "_previous_status", None)
    if not previous or previous == instance.status:
        return

    event_map = {
        AuctionStatus.LIVE: AUCTION_STARTED,
        AuctionStatus.ENDED: AUCTION_ENDED,
        AuctionStatus.SOLD: AUCTION_ENDED,
    }
    event_type = event_map.get(instance.status, AUCTION_UPDATED)
    if instance.status in (AuctionStatus.ENDED, AuctionStatus.SOLD, AuctionStatus.CANCELLED):
        end_active_streams_for_auction(auction_id=instance.id, reason=f"auction_{instance.status.lower()}")
    publish_auction_event(
        auction_id=instance.id,
        event_type=event_type,
        payload={"auction_id": instance.id, "status": instance.status},
    )
    publish_auction_snapshot(
        auction_id=instance.id,
        snapshot=build_auction_snapshot(auction=instance),
        broadcast=True,
    )
