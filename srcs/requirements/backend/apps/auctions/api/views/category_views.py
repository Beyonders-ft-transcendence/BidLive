from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.auctions.models import AuctionCategory
from apps.auctions.selectors import get_category_by_id, list_categories
from apps.auctions.serializers import (
    AuctionCategoryCreateSerializer,
    AuctionCategorySerializer,
    AuctionCategoryUpdateSerializer,
)
from apps.auctions.services import create_category, delete_category, update_category
from apps.users.permissions.rbac import HasRBACPermission
from common.responses import error_response, success_response

CATEGORY_TAGS = ["categories"]


@extend_schema_view(
    list=extend_schema(tags=CATEGORY_TAGS, summary="Listar categorias", auth=[]),
    retrieve=extend_schema(tags=CATEGORY_TAGS, summary="Detalhar categoria", auth=[]),
    create=extend_schema(tags=CATEGORY_TAGS, summary="Criar categoria"),
    update=extend_schema(tags=CATEGORY_TAGS, summary="Atualizar categoria"),
    partial_update=extend_schema(tags=CATEGORY_TAGS, summary="Atualizar categoria parcialmente"),
    destroy=extend_schema(tags=CATEGORY_TAGS, summary="Remover categoria"),
)
class AuctionCategoryViewSet(viewsets.GenericViewSet):
    serializer_class = AuctionCategorySerializer
    permission_classes = [IsAuthenticated, HasRBACPermission]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_required_permissions(self):
        action_map = {
            "list": ["auction.read"],
            "retrieve": ["auction.read"],
            "create": ["auction.update"],
            "update": ["auction.update"],
            "partial_update": ["auction.update"],
            "destroy": ["auction.update"],
        }
        return action_map.get(self.action, [])

    @property
    def required_permissions(self):
        return self.get_required_permissions()

    def get_serializer_class(self):
        serializer_map = {
            "list": AuctionCategorySerializer,
            "retrieve": AuctionCategorySerializer,
            "create": AuctionCategoryCreateSerializer,
            "update": AuctionCategoryUpdateSerializer,
            "partial_update": AuctionCategoryUpdateSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return AuctionCategory.objects.none()
        return list_categories()

    def list(self, request):
        categories = self.get_queryset()
        serializer = AuctionCategorySerializer(categories, many=True)
        return success_response(serializer.data)

    def retrieve(self, request, pk=None):
        category = get_category_by_id(category_id=int(pk))
        return success_response(AuctionCategorySerializer(category).data)

    @extend_schema(
        tags=CATEGORY_TAGS,
        summary="Criar categoria",
        request=AuctionCategoryCreateSerializer,
        responses={201: AuctionCategorySerializer},
    )
    def create(self, request):
        serializer = AuctionCategoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            category = create_category(data=serializer.validated_data)
        except ValidationError as exc:
            return error_response(exc.detail, status_code=status.HTTP_400_BAD_REQUEST)
        return success_response(
            AuctionCategorySerializer(category).data,
            message="Categoria criada com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        tags=CATEGORY_TAGS,
        summary="Atualizar categoria",
        request=AuctionCategoryUpdateSerializer,
        responses={200: AuctionCategorySerializer},
    )
    def update(self, request, pk=None):
        return self._update_category(request, pk=pk, partial=False)

    @extend_schema(
        tags=CATEGORY_TAGS,
        summary="Atualizar categoria parcialmente",
        request=AuctionCategoryUpdateSerializer,
        responses={200: AuctionCategorySerializer},
    )
    def partial_update(self, request, pk=None):
        return self._update_category(request, pk=pk, partial=True)

    def _update_category(self, request, *, pk, partial: bool):
        category = get_category_by_id(category_id=int(pk))
        serializer = AuctionCategoryUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            updated = update_category(
                category=category,
                data=serializer.validated_data,
                partial=partial,
            )
        except ValidationError as exc:
            return error_response(exc.detail, status_code=status.HTTP_400_BAD_REQUEST)
        return success_response(
            AuctionCategorySerializer(updated).data,
            message="Categoria atualizada com sucesso.",
        )

    def destroy(self, request, pk=None):
        category = get_category_by_id(category_id=int(pk))
        try:
            delete_category(category=category)
        except ValidationError as exc:
            return error_response(exc.detail, status_code=status.HTTP_400_BAD_REQUEST)
        return success_response(
            {},
            message="Categoria removida com sucesso.",
            status_code=status.HTTP_204_NO_CONTENT,
        )
