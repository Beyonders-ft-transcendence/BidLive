from django.utils import timezone

def schedule_auction_activation(*, auction_id: int, start_time) -> None:
    from apps.auctions.tasks.activate_auction import activate_auction_task

    now = timezone.now()
    if start_time <= now:
        activate_auction_task.delay(auction_id)
        return
    activate_auction_task.apply_async(args=[auction_id], eta=start_time)


def schedule_auction_close(*, auction_id: int, end_time) -> None:
    from apps.auctions.tasks.close_auction import close_auction_task

    now = timezone.now()
    if end_time <= now:
        close_auction_task.delay(auction_id)
        return
    close_auction_task.apply_async(args=[auction_id], eta=end_time)
