from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.auctions.services.realtime_service import auction_group_name
from apps.users.authorization_service import user_has_permission


class AuctionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.auction_id = self.scope["url_route"]["kwargs"]["auction_id"]
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return
        has_permission = await sync_to_async(user_has_permission)(
            user=user, permission_name="auction.read"
        )
        if not has_permission:
            await self.close(code=4403)
            return

        self.group_name = auction_group_name(auction_id=self.auction_id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def auction_event(self, event):
        await self.send_json({"event": event.get("event"), "payload": event.get("payload")})
