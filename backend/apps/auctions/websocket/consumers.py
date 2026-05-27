from decimal import Decimal, InvalidOperation

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import ValidationError

from apps.auctions.events import USER_JOINED, USER_LEFT
from apps.auctions.models import Auction
from apps.auctions.serializers import BidCreateSerializer
from apps.auctions.services import place_bid
from apps.auctions.services.anti_spam_service import BidRateLimitExceeded
from apps.auctions.services.realtime_service import (
    auction_group_name,
    build_presence_payload,
    decrement_auction_presence,
    get_auction_snapshot,
    increment_auction_presence,
)
from apps.users.authorization_service import user_has_permission


@sync_to_async
def _has_auction_read_permission(user) -> bool:
    return user_has_permission(user=user, permission_name="auction.read")


@sync_to_async
def _get_snapshot(auction_id: int) -> dict | None:
    return get_auction_snapshot(auction_id=auction_id)


@sync_to_async
def _get_auction(auction_id: int) -> Auction:
    return Auction.objects.select_related("item").get(pk=auction_id)


@sync_to_async
def _place_bid(*, bidder, auction: Auction, amount: Decimal, ip_address: str, metadata: dict) -> None:
    place_bid(
        bidder=bidder,
        auction=auction,
        amount=amount,
        ip_address=ip_address,
        metadata=metadata,
    )


class AuctionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.auction_id = int(self.scope["url_route"]["kwargs"]["auction_id"])
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return
        has_permission = await _has_auction_read_permission(user)
        if not has_permission:
            await self.close(code=4403)
            return

        self.group_name = auction_group_name(auction_id=self.auction_id)
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        snapshot = await _get_snapshot(self.auction_id)
        if snapshot is None:
            await self.close(code=4404)
            return

        active_connections = await sync_to_async(increment_auction_presence)(auction_id=self.auction_id)
        snapshot["active_connections"] = active_connections
        await self.send_json({"event": "auction_snapshot", "payload": snapshot})

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "auction.event",
                "event": USER_JOINED,
                "payload": build_presence_payload(
                    auction_id=self.auction_id,
                    user=user,
                    watcher_count=int(snapshot.get("watcher_count", 0) or 0),
                    active_connections=active_connections,
                ),
            },
        )

    async def disconnect(self, close_code):
        if not hasattr(self, "group_name"):
            return

        active_connections = await sync_to_async(decrement_auction_presence)(auction_id=self.auction_id)
        snapshot = await _get_snapshot(self.auction_id) or {}
        user = self.scope.get("user")
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "auction.event",
                "event": USER_LEFT,
                "payload": build_presence_payload(
                    auction_id=self.auction_id,
                    user=user,
                    watcher_count=int(snapshot.get("watcher_count", 0) or 0),
                    active_connections=active_connections,
                ),
            },
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action") or content.get("event")
        if action == "ping":
            await self.send_json({"event": "pong", "payload": {"auction_id": self.auction_id}})
            return
        if action != "place_bid":
            await self.send_json(
                {
                    "event": "bid_error",
                    "payload": {"errors": [{"action": ["Unsupported websocket action."]}]},
                }
            )
            return

        serializer = BidCreateSerializer(data=content)
        try:
            serializer.is_valid(raise_exception=True)
            auction = await _get_auction(self.auction_id)
            await _place_bid(
                bidder=self.scope["user"],
                auction=auction,
                amount=serializer.validated_data["amount"],
                ip_address=self._client_ip(),
                metadata=serializer.validated_data.get("metadata") or {},
            )
        except ValidationError as exc:
            await self.send_json({"event": "bid_error", "payload": {"errors": [exc.detail]}})
            return
        except BidRateLimitExceeded as exc:
            await self.send_json({"event": "bid_error", "payload": {"errors": [exc.detail]}})
            return
        except Auction.DoesNotExist:
            await self.send_json(
                {
                    "event": "bid_error",
                    "payload": {"errors": [{"auction": ["Auction not found."]}]},
                }
            )
            return
        except (InvalidOperation, TypeError):
            await self.send_json(
                {
                    "event": "bid_error",
                    "payload": {"errors": [{"amount": ["Invalid bid amount."]}]},
                }
            )
            return

        await self.send_json({"event": "bid_accepted", "payload": {"auction_id": self.auction_id}})

    async def auction_event(self, event):
        await self.send_json({"event": event.get("event"), "payload": event.get("payload")})

    def _client_ip(self) -> str:
        headers = {key.lower(): value for key, value in self.scope.get("headers", [])}
        forwarded_for = headers.get(b"x-forwarded-for", b"").decode("utf-8")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        client = self.scope.get("client")
        if client and client[0]:
            return str(client[0])
        return ""
