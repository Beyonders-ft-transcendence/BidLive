from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from apps.auctions.models import Auction
from apps.auctions.permissions import IsLiveStreamOwnerOrManager
from apps.auctions.selectors import get_stream_for_auction, list_streams_for_auction, list_viewers_for_stream
from apps.auctions.serializers import (
    StreamCreateSerializer,
    StreamDetailSerializer,
    StreamEndSerializer,
    StreamListSerializer,
    StreamRegenerateKeySerializer,
    StreamStartSerializer,
    StreamUpdateSerializer,
    StreamViewerSerializer,
)
from apps.auctions.services import (
    cancel_stream,
    create_stream,
    end_stream,
    regenerate_stream_key,
    start_stream,
    update_stream,
)
from apps.users.permissions.rbac import HasRBACPermission
from common.responses import error_response, success_response


STREAM_TAGS = ["streams"]


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


@extend_schema_view(
    list=extend_schema(tags=STREAM_TAGS, summary="Listar streams do leilao"),
    retrieve=extend_schema(tags=STREAM_TAGS, summary="Detalhar stream"),
    create=extend_schema(tags=STREAM_TAGS, summary="Criar stream"),
    partial_update=extend_schema(tags=STREAM_TAGS, summary="Atualizar stream"),
    destroy=extend_schema(tags=STREAM_TAGS, summary="Remover stream"),
)
class StreamViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, HasRBACPermission, IsLiveStreamOwnerOrManager]
    serializer_class = StreamDetailSerializer

    def get_required_permissions(self):
        action_map = {
            "list": ["auction.read"],
            "retrieve": ["auction.read"],
            "create": ["auction.update"],
            "partial_update": ["auction.update"],
            "destroy": ["auction.update"],
            "start": ["auction.update"],
            "end": ["auction.update"],
            "regenerate_key": ["auction.update"],
            "viewers": ["auction.read"],
        }
        return action_map.get(self.action, [])

    @property
    def required_permissions(self):
        return self.get_required_permissions()

    def get_serializer_class(self):
        serializer_map = {
            "list": StreamListSerializer,
            "retrieve": StreamDetailSerializer,
            "create": StreamCreateSerializer,
            "partial_update": StreamUpdateSerializer,
            "start": StreamStartSerializer,
            "end": StreamEndSerializer,
            "regenerate_key": StreamRegenerateKeySerializer,
            "viewers": StreamViewerSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_auction(self) -> Auction:
        return Auction.objects.select_related("item", "item__seller").get(pk=int(self.kwargs["auction_id"]))

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return list_streams_for_auction(auction_id=0)
        return list_streams_for_auction(auction_id=int(self.kwargs["auction_id"]))

    def get_object(self):
        return get_stream_for_auction(auction_id=int(self.kwargs["auction_id"]), stream_id=int(self.kwargs["pk"]))

    def list(self, request, auction_id=None):
        queryset = self.get_queryset()
        serializer = StreamListSerializer(queryset, many=True)
        return success_response(serializer.data)

    def retrieve(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        return success_response(StreamDetailSerializer(stream).data)

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Criar stream",
        request=StreamCreateSerializer,
        responses={201: StreamDetailSerializer},
    )
    def create(self, request, auction_id=None):
        auction = self.get_auction()
        serializer = StreamCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stream = create_stream(
            actor=request.user,
            auction=auction,
            data=serializer.validated_data,
            ip_address=_client_ip(request),
        )
        return success_response(
            StreamDetailSerializer(stream).data,
            message="Stream criada com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Atualizar stream",
        request=StreamUpdateSerializer,
        responses={200: StreamDetailSerializer},
    )
    def partial_update(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = update_stream(
            actor=request.user,
            stream=stream,
            data=serializer.validated_data,
            ip_address=_client_ip(request),
        )
        return success_response(StreamDetailSerializer(updated).data, message="Stream atualizada.")

    def destroy(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        cancelled = cancel_stream(actor=request.user, stream=stream, ip_address=_client_ip(request))
        return success_response(
            StreamDetailSerializer(cancelled).data,
            message="Stream removida.",
            status_code=status.HTTP_200_OK,
        )

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Iniciar stream",
        request=StreamStartSerializer,
        responses={200: StreamDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = start_stream(
            actor=request.user,
            stream=stream,
            stream_key=serializer.validated_data.get("stream_key", ""),
            ip_address=_client_ip(request),
            metadata=serializer.validated_data.get("metadata") or {},
        )
        return success_response(StreamDetailSerializer(updated).data, message="Stream iniciada.")

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Encerrar stream",
        request=StreamEndSerializer,
        responses={200: StreamDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="end")
    def end(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ended = end_stream(
            actor=request.user,
            stream=stream,
            reason=serializer.validated_data.get("reason", ""),
            ip_address=_client_ip(request),
        )
        return success_response(StreamDetailSerializer(ended).data, message="Stream encerrada.")

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Rotacionar stream key",
        request=StreamRegenerateKeySerializer,
        responses={200: StreamDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="regenerate-key")
    def regenerate_key(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamRegenerateKeySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = regenerate_stream_key(
            actor=request.user,
            stream=stream,
            ip_address=_client_ip(request),
        )
        return success_response(StreamDetailSerializer(updated).data, message="Stream key atualizada.")

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Listar viewers da stream",
        responses={200: StreamViewerSerializer(many=True)},
    )
    @action(detail=True, methods=["get"], url_path="viewers")
    def viewers(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        viewers = list_viewers_for_stream(stream_id=stream.id)
        serializer = StreamViewerSerializer(viewers, many=True)
        return success_response(
            {"count": viewers.count(), "results": serializer.data},
            message="Viewers carregados.",
        )

