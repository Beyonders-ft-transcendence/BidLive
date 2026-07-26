from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.social.selectors import (
    list_friends,
    list_online_friends,
    list_pending_requests_received,
    list_pending_requests_sent,
    list_blocked_users,
)
from apps.social.serializers import (
    FriendshipCreateSerializer,
    FriendshipSerializer,
    PublicUserSerializer,
)
from apps.social.services import (
    accept_friend_request,
    block_user,
    reject_friend_request,
    remove_friend,
    send_friend_request,
    unblock_user,
)
from apps.users.models import User
from common.responses import error_response, success_response


SOCIAL_TAGS = ["social"]


@extend_schema_view(
    list=extend_schema(tags=SOCIAL_TAGS, summary="Listar amigos"),
    create=extend_schema(tags=SOCIAL_TAGS, summary="Enviar pedido de amizade"),
    destroy=extend_schema(tags=SOCIAL_TAGS, summary="Remover amizade"),
)
class FriendshipViewSet(viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return FriendshipCreateSerializer
        return FriendshipSerializer

    def list(self, request: Request):
        """GET /api/social/friendships/ — lista de amigos aceites"""
        friends = list_friends(user=request.user)
        serializer = PublicUserSerializer(friends, many=True)
        return success_response(data=serializer.data)

    def create(self, request: Request):
        """POST /api/social/friendships/ — enviar pedido de amizade"""
        serializer = FriendshipCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        addressee: User = serializer.validated_data["addressee_id"]

        try:
            friendship = send_friend_request(
                requester=request.user,
                addressee=addressee,
            )
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        out = FriendshipSerializer(friendship)
        return success_response(data=out.data, status_code=status.HTTP_201_CREATED)

    def destroy(self, request: Request, pk=None):
        """DELETE /api/social/friendships/{id}/ — remover amizade"""
        try:
            remove_friend(friend_id=int(pk), user=request.user)
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Amizade removida.")

    @extend_schema(tags=SOCIAL_TAGS, summary="Aceitar pedido de amizade")
    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request: Request, pk=None):
        """POST /api/social/friendships/{id}/accept/"""
        try:
            friendship = accept_friend_request(friendship_id=int(pk), user=request.user)
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(data=FriendshipSerializer(friendship).data)

    @extend_schema(tags=SOCIAL_TAGS, summary="Rejeitar pedido de amizade")
    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request: Request, pk=None):
        """POST /api/social/friendships/{id}/reject/"""
        try:
            reject_friend_request(friendship_id=int(pk), user=request.user)
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Pedido rejeitado.")

    @extend_schema(tags=SOCIAL_TAGS, summary="Pedidos de amizade recebidos")
    @action(detail=False, methods=["get"], url_path="requests/received")
    def requests_received(self, request: Request):
        """GET /api/social/friendships/requests/received/"""
        qs = list_pending_requests_received(user=request.user)
        return success_response(data=FriendshipSerializer(qs, many=True).data)

    @extend_schema(tags=SOCIAL_TAGS, summary="Pedidos de amizade enviados")
    @action(detail=False, methods=["get"], url_path="requests/sent")
    def requests_sent(self, request: Request):
        """GET /api/social/friendships/requests/sent/"""
        qs = list_pending_requests_sent(user=request.user)
        return success_response(data=FriendshipSerializer(qs, many=True).data)

    @extend_schema(tags=SOCIAL_TAGS, summary="Amigos online")
    @action(detail=False, methods=["get"], url_path="online")
    def online(self, request: Request):
        """GET /api/social/friendships/online/"""
        friends = list_online_friends(user=request.user)
        return success_response(data=PublicUserSerializer(friends, many=True).data)


class BlockViewSet(viewsets.GenericViewSet):

    permission_classes = [IsAuthenticated]

    @extend_schema(tags=SOCIAL_TAGS, summary="Bloquear utilizador")
    @action(detail=False, methods=["post"], url_path="block")
    def block(self, request: Request):
        """POST /api/social/users/block/"""
        user_id = request.data.get("user_id")
        if not user_id:
            return error_response(
                errors={"user_id": ["Este campo é obrigatório."]},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        blocked_user = get_object_or_404(
            User, id=user_id, is_active=True, is_deleted=False
        )

        try:
            block_user(blocker=request.user, blocked=blocked_user)
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Utilizador bloqueado.")

    @extend_schema(tags=SOCIAL_TAGS, summary="Desbloquear utilizador")
    @action(detail=False, methods=["post"], url_path="unblock")
    def unblock(self, request: Request):
        """POST /api/social/users/unblock/"""
        user_id = request.data.get("user_id")
        if not user_id:
            return error_response(
                errors={"user_id": ["Este campo é obrigatório."]},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        blocked_user = get_object_or_404(
            User, id=user_id, is_active=True, is_deleted=False
        )

        try:
            unblock_user(blocker=request.user, blocked=blocked_user)
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            return error_response(errors=detail, status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)

        return success_response(message="Bloqueio removido.")
    
    @extend_schema(tags=SOCIAL_TAGS, summary="Listar utilizadores bloqueados")
    @action(detail=False, methods=["get"], url_path="blocked")
    def blocked(self, request: Request):
        """GET /api/social/users/blocked/"""

        users = list_blocked_users(user=request.user)

        return success_response(
            data=PublicUserSerializer(users, many=True).data
        )

