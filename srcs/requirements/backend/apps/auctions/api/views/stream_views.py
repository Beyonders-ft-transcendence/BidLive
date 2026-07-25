from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, extend_schema_view, inline_serializer
from rest_framework import serializers as drf_serializers
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.auctions.models import Auction
from apps.auctions.permissions import IsLiveStreamOwnerOrManager
from apps.auctions.selectors import get_stream_for_auction, list_streams_for_auction, list_viewers_for_stream
from apps.auctions.serializers import (
    StreamCreateSerializer,
    StreamDetailSerializer,
    StreamEndSerializer,
    StreamLiveKitTokenRequestSerializer,
    StreamLiveKitTokenResponseSerializer,
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
    issue_livekit_stream_token,
    regenerate_stream_key,
    start_stream,
    update_stream,
)
from apps.users.permissions.rbac import HasRBACPermission
from apps.storage.media_inputs import apply_optional_file_reference
from common.responses import error_response, success_response


STREAM_TAGS = ["streams"]

STREAM_ERROR_RESPONSE = inline_serializer(
    name="StreamErrorResponse",
    fields={
        "success": drf_serializers.BooleanField(default=False),
        "message": drf_serializers.CharField(required=False),
        "errors": drf_serializers.ListField(child=drf_serializers.DictField()),
    },
)

STREAM_DETAIL_RESPONSE = inline_serializer(
    name="StreamDetailResponse",
    fields={
        "success": drf_serializers.BooleanField(default=True),
        "message": drf_serializers.CharField(required=False),
        "data": StreamDetailSerializer(),
    },
)

STREAM_LIST_RESPONSE = inline_serializer(
    name="StreamListResponse",
    fields={
        "success": drf_serializers.BooleanField(default=True),
        "message": drf_serializers.CharField(required=False),
        "data": StreamListSerializer(many=True),
    },
)

STREAM_VIEWERS_RESPONSE = inline_serializer(
    name="StreamViewersResponse",
    fields={
        "success": drf_serializers.BooleanField(default=True),
        "message": drf_serializers.CharField(required=False),
        "data": drf_serializers.DictField(),
    },
)


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


@extend_schema_view(
    list=extend_schema(
        tags=STREAM_TAGS,
        summary="Listar streams do leilao",
        description="Retorna todas as streams associadas ao auction informado.",
        responses={
            200: OpenApiResponse(response=STREAM_LIST_RESPONSE, description="Streams retornadas com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para leitura."),
        },
    ),
    retrieve=extend_schema(
        tags=STREAM_TAGS,
        summary="Detalhar stream",
        description="Retorna o detalhe completo da stream e seus metadados realtime.",
        responses={
            200: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream retornada com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para leitura."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
    ),
    create=extend_schema(
        tags=STREAM_TAGS,
        summary="Criar stream",
        description="Cria uma stream vinculada ao auction e gera uma stream_key segura.",
    ),
    partial_update=extend_schema(
        tags=STREAM_TAGS,
        summary="Atualizar stream",
        description="Atualiza metadados da stream antes ou durante o preparo da live.",
    ),
    destroy=extend_schema(
        tags=STREAM_TAGS,
        summary="Remover stream",
        description="Cancela a stream e encerra o fluxo realtime associado.",
    ),
)
class StreamViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, HasRBACPermission, IsLiveStreamOwnerOrManager]
    serializer_class = StreamDetailSerializer

    def get_permissions(self):
        if self.action == "livekit_token":
            return [IsAuthenticated()]
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()

    def get_required_permissions(self):
        action_map = {
            "list": [],
            "retrieve": ["auction.read"],
            "create": ["auction.update"],
            "partial_update": ["auction.update"],
            "destroy": ["auction.update"],
            "start": ["auction.update"],
            "end": ["auction.update"],
            "regenerate_key": ["auction.update"],
            "viewers": ["auction.read"],
            "livekit_token": [],
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
            "livekit_token": StreamLiveKitTokenRequestSerializer,
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
        description=(
            "Cria uma nova stream realtime para um auction. "
            "A resposta inclui a stream_key gerada e o estado inicial READY."
        ),
        request=StreamCreateSerializer,
        responses={
            201: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream criada com sucesso."),
            400: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Erro de validacao."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para criar."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Auction nao encontrada."),
        },
        examples=[
            OpenApiExample(
                "Requisicao de criacao",
                value={
                    "title": "Live de domingo",
                    "description": "Transmissao oficial do leilao",
                    "visibility": "PUBLIC",
                    "stream_meta": {"codec": "h264", "resolution": "1920x1080"},
                },
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de criacao",
                value={
                    "success": True,
                    "message": "Stream criada com sucesso.",
                    "data": {
                        "id": 12,
                        "auction": 5,
                        "auction_id": 5,
                        "streamer": {"id": 1, "username": "seller", "full_name": "Seller Name"},
                        "title": "Live de domingo",
                        "description": "Transmissao oficial do leilao",
                        "thumbnail": None,
                        "stream_key": "sk_live_8f4e2c1a9d92b1f4",
                        "status": "READY",
                        "visibility": "PUBLIC",
                        "is_live": False,
                        "viewer_count": 0,
                        "stream_meta": {"codec": "h264", "resolution": "1920x1080"},
                        "started_at": None,
                        "ended_at": None,
                        "created_at": "2026-05-30T12:00:00Z",
                        "updated_at": "2026-05-30T12:00:00Z",
                        "viewers": [],
                    },
                },
                response_only=True,
                status_codes=["201"],
            ),
        ],
    )
    def create(self, request, auction_id=None):
        auction = self.get_auction()
        serializer = StreamCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stream_data = apply_optional_file_reference(
            data=serializer.validated_data,
            uploader=request.user,
            uploaded_file=request.FILES.get("thumbnail"),
            url_field="thumbnail_url",
            target_field="thumbnail",
            prefix="streams",
        )
        stream = create_stream(
            actor=request.user,
            auction=auction,
            data=stream_data,
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
        description="Atualiza titulo, descricao, visibilidade, thumbnail e metadados da stream.",
        request=StreamUpdateSerializer,
        responses={
            200: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream atualizada com sucesso."),
            400: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Erro de validacao."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para atualizar."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
    )
    def partial_update(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        stream_data = apply_optional_file_reference(
            data=serializer.validated_data,
            uploader=request.user,
            uploaded_file=request.FILES.get("thumbnail"),
            url_field="thumbnail_url",
            target_field="thumbnail",
            prefix="streams",
        )
        updated = update_stream(
            actor=request.user,
            stream=stream,
            data=stream_data,
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
        description=(
            "Valida a stream_key e muda o status da stream para LIVE. "
            "Este endpoint representa o inicio do fluxo de ingestao realtime."
        ),
        request=StreamStartSerializer,
        responses={
            200: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream iniciada com sucesso."),
            400: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream key invalida ou stream indisponivel."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para iniciar."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
        examples=[
            OpenApiExample(
                "Requisicao de inicio",
                value={
                    "stream_key": "sk_live_8f4e2c1a9d92b1f4",
                    "metadata": {"source": "frontend", "protocol": "webrtc"},
                },
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de inicio",
                value={
                    "success": True,
                    "message": "Stream iniciada.",
                    "data": {
                        "id": 12,
                        "auction_id": 5,
                        "status": "LIVE",
                        "is_live": True,
                        "started_at": "2026-05-30T12:05:00Z",
                        "viewer_count": 23,
                    },
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
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
        description=(
            "Encerra a stream manualmente. "
            "O backend tambem pode encerrar automaticamente quando o auction termina."
        ),
        request=StreamEndSerializer,
        responses={
            200: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream encerrada com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para encerrar."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
        examples=[
            OpenApiExample(
                "Requisicao de encerramento",
                value={"reason": "Encerramento manual apos o evento"},
                request_only=True,
            ),
            OpenApiExample(
                "Resposta de encerramento",
                value={
                    "success": True,
                    "message": "Stream encerrada.",
                    "data": {
                        "id": 12,
                        "auction_id": 5,
                        "status": "ENDED",
                        "is_live": False,
                        "ended_at": "2026-05-30T13:05:00Z",
                    },
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
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
        description="Gera uma nova stream_key e invalida a chave anterior para reduzir risco de uso indevido.",
        request=StreamRegenerateKeySerializer,
        responses={
            200: OpenApiResponse(response=STREAM_DETAIL_RESPONSE, description="Stream key rotacionada com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para rotacionar."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
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
        description="Retorna o total de viewers conhecidos e a lista de presencas registradas.",
        responses={
            200: OpenApiResponse(response=STREAM_VIEWERS_RESPONSE, description="Viewers retornados com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para leitura."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
        examples=[
            OpenApiExample(
                "Resposta de viewers",
                value={
                    "success": True,
                    "message": "Viewers carregados.",
                    "data": {
                        "count": 2,
                        "results": [
                            {
                                "id": 1,
                                "viewer": {"id": 2, "username": "viewer1", "full_name": "Viewer One"},
                                "joined_at": "2026-05-30T12:05:10Z",
                                "last_seen_at": "2026-05-30T12:06:00Z",
                            }
                        ],
                    },
                },
                response_only=True,
                status_codes=["200"],
            ),
        ],
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

    @extend_schema(
        tags=STREAM_TAGS,
        summary="Emitir token LiveKit",
        description=(
            "Valida acesso ao auction/stream e emite um token LiveKit para o broadcaster ou viewer. "
            "O frontend usa este token para conectar diretamente na room LiveKit."
        ),
        request=StreamLiveKitTokenRequestSerializer,
        responses={
            200: OpenApiResponse(response=StreamLiveKitTokenResponseSerializer, description="Token emitido com sucesso."),
            401: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Autenticacao ausente ou invalida."),
            403: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Usuario sem permissao para entrar na room."),
            404: OpenApiResponse(response=STREAM_ERROR_RESPONSE, description="Stream nao encontrada."),
        },
    )
    @action(detail=True, methods=["post"], url_path="livekit-token")
    def livekit_token(self, request, auction_id=None, pk=None):
        stream = self.get_object()
        serializer = StreamLiveKitTokenRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = issue_livekit_stream_token(
                stream=stream,
                user=request.user,
                requested_role=serializer.validated_data.get("role", "viewer"),
                participant_name=serializer.validated_data.get("participant_name", ""),
                metadata=serializer.validated_data.get("metadata") or {},
            )
        except Exception as exc:
            return error_response(
                errors={"detail": f"Erro ao gerar token LiveKit: {exc}"},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return success_response(
            payload,
            message="Token LiveKit emitido com sucesso.",
        )
