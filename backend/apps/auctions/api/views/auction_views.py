from django.db import transaction
from django.db.models import Q
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.auctions.filters import AuctionFilter
from apps.auctions.models import Auction, AuctionStatus, Bid
from apps.auctions.permissions import IsAuctionOwnerOrManager
from apps.auctions.selectors import list_auctions, list_bids_for_auction
from apps.auctions.serializers import (
    AuctionBuyNowSerializer,
    AuctionCancelSerializer,
    AuctionCreateSerializer,
    AuctionDetailSerializer,
    AuctionListSerializer,
    AuctionUpdateSerializer,
    BidCreateSerializer,
    BidSerializer,
    ActivitySerializer,
)
from apps.auctions.services import (
    buy_now,
    cancel_auction,
    create_auction,
    place_bid,
    unwatch_auction,
    update_auction,
    watch_auction,
)
from apps.auctions.services.anti_spam_service import BidRateLimitExceeded
from apps.auctions.throttles import BidIPThrottle, BidUserThrottle
from apps.users.authorization_service import user_has_permission
from apps.users.permissions.rbac import HasRBACPermission
from common.responses import error_response, success_response


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


AUCTION_TAGS = ["auctions"]


@extend_schema_view(
    list=extend_schema(tags=AUCTION_TAGS, summary="Listar leiloes", auth=[]),
    retrieve=extend_schema(tags=AUCTION_TAGS, summary="Detalhar leilao", auth=[]),
    create=extend_schema(tags=AUCTION_TAGS, summary="Criar leilao"),
    partial_update=extend_schema(tags=AUCTION_TAGS, summary="Atualizar leilao"),
    destroy=extend_schema(tags=AUCTION_TAGS, summary="Remover leilao"),
)
class AuctionViewSet(viewsets.GenericViewSet):
    serializer_class = AuctionDetailSerializer
    permission_classes = [IsAuthenticated, HasRBACPermission, IsAuctionOwnerOrManager]
    filterset_class = AuctionFilter
    search_fields = ["item__title", "item__description"]
    ordering_fields = ["start_time", "end_time", "item__current_price", "created_at"]

    def get_required_permissions(self):
        action_map = {
            "create": ["auction.create"],
            "partial_update": ["auction.update"],
            "destroy": ["auction.update"],
            "cancel": ["auction.cancel"],
            "buy_now": ["auction.buy_now"],
            "watch": ["auction.watch"],
            "unwatch": ["auction.watch"],
        }
        return action_map.get(self.action, [])

    @property
    def required_permissions(self):
        return self.get_required_permissions()

    def get_permissions(self):
        # Public endpoints: list, retrieve, featured, activities
        if self.action in ["list", "retrieve", "featured", "activities"]:
            return [AllowAny()]
        # All other actions require authentication (default permission classes)
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        serializer_map = {
            "list": AuctionListSerializer,
            "retrieve": AuctionDetailSerializer,
            "create": AuctionCreateSerializer,
            "partial_update": AuctionUpdateSerializer,
            "cancel": AuctionCancelSerializer,
            "buy_now": AuctionBuyNowSerializer,
            "bids": BidSerializer if self.request.method.lower() == "get" else BidCreateSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Auction.objects.none()
        queryset = list_auctions()
        user = self.request.user
        if not user.is_authenticated:
            queryset = queryset.exclude(status__in=[AuctionStatus.DRAFT, AuctionStatus.CANCELLED])
        elif not user_has_permission(user=user, permission_name="auction.manage"):
            queryset = queryset.filter(Q(item__seller=user) | ~Q(status__in=[AuctionStatus.DRAFT, AuctionStatus.CANCELLED]))

        if self.action == "list":
            status_param = self.request.query_params.get("status")
            seller_param = self.request.query_params.get("seller_id")
            if status_param != AuctionStatus.DRAFT and not seller_param:
                queryset = queryset.exclude(status=AuctionStatus.DRAFT)

        return queryset

    def get_throttles(self):
        if self.action == "bids" and self.request.method.lower() == "post":
            return [BidUserThrottle(), BidIPThrottle()]
        return super().get_throttles()

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = AuctionListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return success_response(serializer.data)

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request):
        queryset = self.filter_queryset(self.get_queryset().filter(is_featured=True))
        if not queryset.exists():
            queryset = self.filter_queryset(self.get_queryset().filter(status=AuctionStatus.LIVE)[:4])
        if not queryset.exists():
            queryset = self.filter_queryset(self.get_queryset()[:4])
        
        page = self.paginate_queryset(queryset)
        serializer = AuctionListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return success_response(serializer.data)

    @extend_schema(
        tags=AUCTION_TAGS,
        methods=["GET"],
        summary="Listar atividades globais",
        description="Returns latest 10 bids across all auctions.",
        responses={200: ActivitySerializer(many=True)},
    )
    @action(detail=False, methods=["get"], url_path="activities")
    def activities(self, request):
        queryset = Bid.objects.select_related("bidder", "auction__item").order_by("-created_at")[:10]
        serializer = ActivitySerializer(queryset, many=True)
        return success_response(serializer.data)

    def retrieve(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        return success_response(AuctionDetailSerializer(auction).data)

    @extend_schema(
        tags=AUCTION_TAGS,
        summary="Criar leilao",
        request=AuctionCreateSerializer,
        responses={201: AuctionDetailSerializer},
    )
    def create(self, request):
        serializer = AuctionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        image_urls = payload.pop("image_urls", [])
        auction = create_auction(
            seller=request.user,
            data=payload,
            image_urls=image_urls,
            ip_address=_client_ip(request),
        )
        return success_response(
            AuctionDetailSerializer(auction).data,
            message="Leilao criado com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=AUCTION_TAGS,
        summary="Atualizar leilao",
        request=AuctionUpdateSerializer,
        responses={200: AuctionDetailSerializer},
    )
    def partial_update(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        serializer = AuctionUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        payload = dict(serializer.validated_data)
        image_urls = payload.pop("image_urls", [])
        updated = update_auction(
            actor=request.user,
            auction=auction,
            data=payload,
            image_urls=image_urls,
            ip_address=_client_ip(request),
        )
        return success_response(AuctionDetailSerializer(updated).data, message="Leilao atualizado.")

    def destroy(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        if auction.status != AuctionStatus.DRAFT or auction.bids.exists():
            return error_response({"status": ["Only draft auctions without bids can be deleted."]})
        with transaction.atomic():
            item = auction.item
            auction.delete()
            if item.auctions.count() == 0:
                item.delete()
        return success_response({}, message="Leilao removido.", status_code=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        tags=AUCTION_TAGS,
        summary="Cancelar leilao",
        request=AuctionCancelSerializer,
        responses={200: AuctionDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        serializer = AuctionCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = cancel_auction(
            actor=request.user,
            auction=auction,
            reason=serializer.validated_data.get("reason", ""),
            ip_address=_client_ip(request),
        )
        return success_response(AuctionDetailSerializer(updated).data, message="Leilao cancelado.")

    @extend_schema(
        tags=AUCTION_TAGS,
        summary="Comprar agora",
        request=AuctionBuyNowSerializer,
        responses={200: AuctionDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="buy-now")
    def buy_now(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        updated = buy_now(buyer=request.user, auction=auction, ip_address=_client_ip(request))
        return success_response(AuctionDetailSerializer(updated).data, message="Compra imediata concluida.")

    @extend_schema(
        tags=AUCTION_TAGS,
        summary="Adicionar ou remover favorito",
        responses={200: OpenApiResponse(description="Watch toggled.")},
    )
    @action(detail=True, methods=["post", "delete"], url_path="watch")
    def watch(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        if request.method == "DELETE":
            unwatch_auction(user=request.user, auction=auction)
            return success_response({}, message="Leilao removido dos favoritos.")
        watch_auction(user=request.user, auction=auction)
        return success_response({}, message="Leilao adicionado aos favoritos.")

    @extend_schema(
        tags=AUCTION_TAGS,
        methods=["GET"],
        summary="Listar bids",
        description="Returns paginated bid history ordered by newest first.",
        responses={200: BidSerializer(many=True)},
    )
    @extend_schema(
        tags=AUCTION_TAGS,
        methods=["POST"],
        summary="Registrar bid",
        description="Validates and registers a realtime bid with anti-spam protection.",
        request=BidCreateSerializer,
        responses={200: BidSerializer(many=False)},
    )
    @action(detail=True, methods=["get", "post"], url_path="bids")
    def bids(self, request, pk=None):
        auction = self.get_queryset().get(pk=int(pk))
        if request.method.lower() == "get":
            queryset = list_bids_for_auction(auction_id=auction.id, viewer=request.user)
            page = self.paginate_queryset(queryset)
            serializer = BidSerializer(page or queryset, many=True)
            if page is not None:
                return self.get_paginated_response(serializer.data)
            return success_response(serializer.data)

        serializer = BidCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            bid = place_bid(
                bidder=request.user,
                auction=auction,
                amount=serializer.validated_data["amount"],
                ip_address=_client_ip(request),
                metadata=serializer.validated_data.get("metadata") or {},
            )
        except BidRateLimitExceeded as exc:
            return error_response([exc.detail], status_code=status.HTTP_400_BAD_REQUEST)
        except ValidationError as exc:
            return error_response([exc.detail], status_code=status.HTTP_400_BAD_REQUEST)
        return success_response(BidSerializer(bid).data, message="Bid registrado.")
