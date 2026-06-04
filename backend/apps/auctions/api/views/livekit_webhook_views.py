from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auctions.services.livekit_webhook_service import (
    process_livekit_webhook_event,
    verify_livekit_webhook,
)


class LiveKitWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        body = request.body.decode("utf-8")
        authorization = request.headers.get("Authorization", "")
        payload = verify_livekit_webhook(body=body, authorization=authorization)
        process_livekit_webhook_event(payload=payload)
        return Response(status=status.HTTP_204_NO_CONTENT)
