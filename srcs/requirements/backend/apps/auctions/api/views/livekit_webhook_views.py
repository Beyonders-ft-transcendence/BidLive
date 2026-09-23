from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

import logging

from apps.auctions.services.livekit_webhook_service import (
    process_livekit_webhook_event,
    verify_livekit_webhook,
)

logger = logging.getLogger(__name__)


class LiveKitWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        authorization = request.headers.get("Authorization", "")
        try:
            payload = verify_livekit_webhook(body=request.body, authorization=authorization)
        except Exception as exc:
            logger.error(
                "LiveKit webhook verification failed: %s (auth header present: %s, remote: %s)",
                exc,
                bool(authorization),
                request.META.get("REMOTE_ADDR"),
            )
            raise
        result = process_livekit_webhook_event(payload=payload)
        logger.info(
            "LiveKit webhook processed event '%s': result=%s",
            payload.get("event"),
            result,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
