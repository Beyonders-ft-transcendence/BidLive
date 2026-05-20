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
