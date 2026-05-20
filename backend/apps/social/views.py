from django.shortcuts import get_list_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.social.selectors import (
	list_friends,
	list_online_friends,
	list_pending_requests_received,
	list_pending_requests_sent,
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


SOCIAL_TAGS = [social]


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
		friends = list_friends(user=request.user)
		serializer = PublicUserSerializer(friends, many=True)
		return success_response(data=serializer.data)
	
	def create(self, request: Request):
		serializer = FriendshipCreateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		addressee: User = serializer.validated_data["addressee_id"]

		try:
			friendship = send_friend_request(
				requester=request.user,
				addressee=addressee,
			)
		except Exception as exc:
			return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
		
		out = FriendshipSerializer(friendship)
		return success_response(data=out.data, status_code=status.HTTP_201_CREATED)
	
	def destroy(self, request: Request, pk=None):
		try:
			remove_friend(friendship_id=pk, user=request.user)
		except Exception as exc:
			return error_response(errrors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
		
		return success_response(message="Amizade removida.")
	
	@extend_schema(tags=SOCIAL_TAGS, summary="Aceitar pedido de amizade")
	@action(detail=True, methods=["post"], url_path="accept")
	def accept(self, request: Request, pk=None):
		try:
			friendship = accept_friend_request(friendship_id=pk, user=request.user)
		except Exception as exc:
			return error_response(errors=str(exc), status_code=status.HTTP_400_BAD_REQUEST)
	