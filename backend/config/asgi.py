import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.auctions.websocket.middleware import JWTAuthMiddleware
from apps.auctions.websocket.routing import websocket_urlpatterns as auction_ws
from apps.chat.websocket.routing import websocket_urlpatterns as chat_ws

all_websocket_patterns = auction_ws + chat_ws

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(URLRouter(all_websocket_patterns)),
    }
)
