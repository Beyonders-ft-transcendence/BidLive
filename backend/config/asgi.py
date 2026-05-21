import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from apps.auctions.websocket.middleware import JWTAuthMiddleware
from apps.auctions.websocket.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
