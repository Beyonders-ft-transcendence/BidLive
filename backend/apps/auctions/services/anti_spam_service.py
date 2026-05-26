import time

from django.conf import settings
from django.core.cache import cache

from apps.analytics.services import track_event
from apps.auctions.events import BID_RATE_LIMITED
from apps.auctions.services.realtime_service import publish_auction_event


class BidRateLimitExceeded(Exception):
    def __init__(self, *, retry_after: int, reason: str):
        self.retry_after = retry_after
        self.reason = reason
        self.detail = {
            "throttle": [f"Too many bids. Try again in {retry_after} seconds."],
            "retry_after": retry_after,
        }
        super().__init__(self.detail["throttle"][0])


def _window_count() -> int:
    return int(getattr(settings, "AUCTION_BID_RATE_LIMIT_COUNT", 5))


def _window_seconds() -> int:
    return int(getattr(settings, "AUCTION_BID_RATE_LIMIT_WINDOW_SECONDS", 10))


def _block_seconds() -> int:
    return int(getattr(settings, "AUCTION_BID_RATE_LIMIT_BLOCK_SECONDS", 30))


def _cooldown_seconds() -> int:
    return int(getattr(settings, "AUCTION_BID_COOLDOWN_SECONDS", 0))


def _counter_key(*, subject: str, value: str) -> str:
    return f"auction:bids:rate:{subject}:{value}"


def _blocked_key(*, subject: str, value: str) -> str:
    return f"auction:bids:blocked:{subject}:{value}"


def _cooldown_key(*, user_id: int) -> str:
    return f"auction:bids:cooldown:user:{user_id}"


def _increment_counter(*, cache_key: str, timeout: int) -> int:
    if cache.add(cache_key, 1, timeout=timeout):
        return 1
    try:
        return int(cache.incr(cache_key))
    except ValueError:
        cache.set(cache_key, 1, timeout=timeout)
        return 1


def _seconds_remaining(blocked_until: float) -> int:
    return max(1, int(blocked_until - time.time()))


def _raise_limit_error(*, auction_id: int, user, ip_address: str, retry_after: int, reason: str) -> None:
    publish_auction_event(
        auction_id=auction_id,
        event_type=BID_RATE_LIMITED,
        payload={
            "auction_id": auction_id,
            "user_id": getattr(user, "id", None),
            "retry_after": retry_after,
            "reason": reason,
        },
    )
    track_event(
        user=user,
        event_type="auction.bid.rate_limited",
        metadata={
            "auction_id": auction_id,
            "reason": reason,
            "retry_after": retry_after,
            "ip_address": ip_address,
        },
        ip_address=ip_address,
    )
    raise BidRateLimitExceeded(retry_after=retry_after, reason=reason)


def _ensure_not_blocked(*, auction_id: int, user, ip_address: str, subject: str, value: str) -> None:
    blocked_until = cache.get(_blocked_key(subject=subject, value=value))
    if blocked_until:
        _raise_limit_error(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            retry_after=_seconds_remaining(float(blocked_until)),
            reason="temporary_block",
        )


def _ensure_cooldown(*, auction_id: int, user, ip_address: str) -> None:
    cooldown = _cooldown_seconds()
    if cooldown <= 0 or not getattr(user, "id", None):
        return

    last_bid_at = cache.get(_cooldown_key(user_id=user.id))
    if last_bid_at is None:
        return

    retry_after = max(1, cooldown - int(time.time() - float(last_bid_at)))
    if retry_after > 0:
        _raise_limit_error(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            retry_after=retry_after,
            reason="cooldown",
        )


def _consume_subject(*, auction_id: int, user, ip_address: str, subject: str, value: str) -> None:
    total = _increment_counter(
        cache_key=_counter_key(subject=subject, value=value),
        timeout=_window_seconds(),
    )
    if total <= _window_count():
        return

    retry_after = _block_seconds()
    cache.set(_blocked_key(subject=subject, value=value), time.time() + retry_after, timeout=retry_after)
    _raise_limit_error(
        auction_id=auction_id,
        user=user,
        ip_address=ip_address,
        retry_after=retry_after,
        reason=f"{subject}_window_limit",
    )


def enforce_bid_rate_limit(*, auction_id: int, user, ip_address: str = "") -> None:
    _ensure_cooldown(auction_id=auction_id, user=user, ip_address=ip_address)

    if getattr(user, "id", None):
        user_value = str(user.id)
        _ensure_not_blocked(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            subject="user",
            value=user_value,
        )
        _consume_subject(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            subject="user",
            value=user_value,
        )

    if ip_address:
        _ensure_not_blocked(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            subject="ip",
            value=ip_address,
        )
        _consume_subject(
            auction_id=auction_id,
            user=user,
            ip_address=ip_address,
            subject="ip",
            value=ip_address,
        )

    cooldown = _cooldown_seconds()
    if cooldown > 0 and getattr(user, "id", None):
        cache.set(_cooldown_key(user_id=user.id), time.time(), timeout=cooldown)
