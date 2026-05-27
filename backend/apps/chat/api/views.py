from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.chat.selectors import (
    get_private_conversation,
    get_room_messages,
    list_private_conversations,
    list_private_messages,
    get_or_create_auction_room,
)
from apps.chat.serializers import (
    ChatRoomSerializer,
    PrivateConversationSerializer,
    PrivateMessageSerializer,
    RoomMessageSerializer,
    SendPrivateMessageSerializer,
    SendRoomMessageSerializer,
)
from apps.chat.services import (
    delete_private_message,
    mark_messages_as_read,
    send_private_message,
    send_room_message,
    soft_delete_room_message,
)
from common.responses import error_response, success_response

CHAT_TAGS = ["chat"]


@extend_schema_view(
    list=extend_schema(tags=CHAT_TAGS, summary="Listar conversas privadas"),
    messages=extend_schema(tags=CHAT_TAGS, summary="Mensagens de uma conversa"),
    send=extend_schema(tags=CHAT_TAGS, summary="Enviar mensagem privada"),
    read=extend_schema(tags=CHAT_TAGS, summary="Marcar mensagens como lidas"),
    delete_message=extend_schema(tags=CHAT_TAGS, summary="Apagar mensagem privada"),
)
class PrivateConversationViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request: Request):
        """GET /api/chat/conversations/ — lista de conversas com preview"""
        conversations = list_private_conversations(user=request.user)

        conversations = conversations.prefetch_related("messages")

        serializer = PrivateConversationSerializer(
            conversations,
            many=True,
            context={"request": request}, 
        )
        return success_response(data=serializer.data)

    @action(detail=True, methods=["get"], url_path="messages")
    def messages(self, request: Request, pk=None):
        """GET /api/chat/conversations/{id}/messages/ — histórico de mensagens"""
        conversation = get_private_conversation(conversation_id=pk, user=request.user)
        if not conversation:
            return error_response(
                errors={"detail": "Conversa não encontrada."},
                status_code=status.HTTP_404_NOT_FOUND,
            )

        msgs = list_private_messages(conversation_id=pk, user=request.user)
        return success_response(data=PrivateMessageSerializer(msgs, many=True).data)

    @action(detail=False, methods=["post"], url_path="send")
    def send(self, request: Request):
        serializer = SendPrivateMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        recipient = serializer.validated_data["recipient_id"]
        text = serializer.validated_data["message"]

        try:
            message = send_private_message(
                sender=request.user,
                recipient=recipient,
                text=text,
            )
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(
            data=PrivateMessageSerializer(message).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="read")
    def read(self, request: Request, pk=None):
        """POST /api/chat/conversations/{id}/read/ — marcar mensagens como lidas"""
        try:
            count = mark_messages_as_read(conversation_id=pk, user=request.user)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message=f"{count} mensagem(ns) marcada(s) como lida(s).")

    @action(detail=False, methods=["delete"], url_path="messages/(?P<message_id>[^/.]+)")
    def delete_message(self, request: Request, message_id=None):
        """DELETE /api/chat/conversations/messages/{id}/ — apagar mensagem"""
        try:
            delete_private_message(message_id=message_id, user=request.user)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Mensagem apagada.")
