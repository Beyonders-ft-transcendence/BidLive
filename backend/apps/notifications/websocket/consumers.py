import logging

from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        try:
            user = self.scope.get("user")
            if not user or not user.is_authenticated:
                logger.warning("WS Notifications — utilizador não autenticado")
                await self.close(code=4401)
                return

            self.user = user

            if self.channel_layer is None:
                logger.error("WS Notifications — channel_layer é None (Redis offline?)")
                await self.close(code=4500)
                return

            self.group_name = f"user_{user.id}_notifications"

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            logger.info(f"WS Notifications CONNECTED — {user.email} | group: {self.group_name}")

        except Exception as e:
            logger.error(f"WS Notifications connect() ERROR — {type(e).__name__}: {e}")
            await self.close(code=4500)

    async def disconnect(self, close_code):
        if hasattr(self, "group_name") and self.channel_layer is not None:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"WS Notifications DISCONNECTED — group: {self.group_name}")

    async def receive_json(self, content: dict):
        # Notifications are push-only from server to client, but let's log unexpected client messages
        logger.info(f"WS Notifications received message from client: {content}")
        await self.send_json({"error": "Mensagens do cliente não são suportadas neste canal."})

    async def notification_message(self, event: dict):
        """Called when a message is sent to the user's notification group."""
        await self.send_json({
            "type": "notification.message",
            "notification": event["notification"],
        })
