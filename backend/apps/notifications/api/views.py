from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from common.responses import success_response

NOTIFICATION_TAGS = ["notifications"]


@extend_schema_view(
    list=extend_schema(tags=NOTIFICATION_TAGS, summary="Listar histórico de notificações"),
    read=extend_schema(tags=NOTIFICATION_TAGS, summary="Marcar notificação como lida"),
)
class NotificationViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def list(self, request: Request):
        """GET /api/notifications/ — lista de notificações do usuário autenticado"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return success_response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="read")
    def read(self, request: Request, pk=None):
        """PATCH /api/notifications/{id}/read/ — marcar notificação como lida"""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        serializer = self.get_serializer(notification)
        return success_response(
            data=serializer.data,
            message="Notificação marcada como lida com sucesso."
        )
