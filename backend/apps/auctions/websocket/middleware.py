import logging
from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)


@sync_to_async
def _get_user_from_token(raw_token: str):
    try:
        authenticator = JWTAuthentication()
        validated_token = authenticator.get_validated_token(raw_token)
        user = authenticator.get_user(validated_token)
        logger.info(f"WS Auth OK — user: {user.email}")
        return user
    except TokenError as e:
        logger.warning(f"WS Auth FAILED — TokenError: {e}")
        return AnonymousUser()
    except InvalidToken as e:
        logger.warning(f"WS Auth FAILED — InvalidToken: {e}")
        return AnonymousUser()
    except Exception as e:
        logger.error(f"WS Auth FAILED — {type(e).__name__}: {e}")
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        params = parse_qs(query_string)
        token = params.get("token", [""])[0]

        if not token:
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode("utf-8")
            if auth_header.lower().startswith("bearer "):
                token = auth_header.split(" ", 1)[1].strip()

        if token:
            scope["user"] = await _get_user_from_token(token)
        else:
            logger.warning("WS — ligação sem token")
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
    