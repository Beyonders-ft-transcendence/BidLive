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

        # Broadcast message to WebSocket group if channel layer is available
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            from apps.chat.websocket.consumers import private_group_name
            
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = private_group_name(request.user.id, recipient.id)
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "chat.message",
                        "message_id": message.id,
                        "message": message.message,
                        "sender_id": message.sender_id,
                        "sender_username": message.sender.username,
                        "sender_avatar": message.sender.avatar_url or "",
                        "created_at": message.created_at.isoformat(),
                    }
                )
        except Exception as ws_err:
            pass

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


@extend_schema_view(
    room=extend_schema(tags=CHAT_TAGS, summary="Sala de chat de um leilão"),
    messages=extend_schema(tags=CHAT_TAGS, summary="Histórico de mensagens da sala"),
    send=extend_schema(tags=CHAT_TAGS, summary="Enviar mensagem na sala"),
    delete_message=extend_schema(tags=CHAT_TAGS, summary="Apagar mensagem da sala"),
)
class AuctionChatViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="room")
    def room(self, request: Request, pk=None):
        """GET /api/chat/auctions/{auction_id}/room/ — info da sala"""
        room, _ = get_or_create_auction_room(auction_id=pk)
        return success_response(data=ChatRoomSerializer(room).data)

    @action(detail=True, methods=["get"], url_path="messages")
    def messages(self, request: Request, pk=None):
        """GET /api/chat/auctions/{auction_id}/messages/ — histórico da sala"""
        room, _ = get_or_create_auction_room(auction_id=pk)
        msgs = get_room_messages(room_id=room.id)
        return success_response(data=RoomMessageSerializer(msgs, many=True).data)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request: Request, pk=None):
        """POST /api/chat/auctions/{auction_id}/send/ — enviar mensagem via REST"""
        serializer = SendRoomMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            message = send_room_message(
                sender=request.user,
                auction_id=pk,
                text=serializer.validated_data["message"],
            )
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        # Broadcast message to WebSocket group if channel layer is available
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            from apps.chat.websocket.consumers import auction_chat_group_name
            
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = auction_chat_group_name(int(pk))
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "chat.message",
                        "message_id": message.id,
                        "message": message.message,
                        "sender_id": message.sender_id,
                        "sender_username": message.sender.username,
                        "sender_avatar": message.sender.avatar_url or "",
                        "created_at": message.created_at.isoformat(),
                    }
                )
        except Exception as ws_err:
            pass

        return success_response(
            data=RoomMessageSerializer(message).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["delete"], url_path="messages/(?P<message_id>[^/.]+)")
    def delete_message(self, request: Request, message_id=None):
        """DELETE /api/chat/auctions/messages/{id}/ — apagar mensagem da sala"""
        try:
            soft_delete_room_message(message_id=message_id, user=request.user)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Mensagem apagada.")
