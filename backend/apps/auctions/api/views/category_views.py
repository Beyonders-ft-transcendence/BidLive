from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.auctions.selectors import list_categories
from apps.auctions.serializers import AuctionCategorySerializer
from apps.users.permissions.rbac import HasRBACPermission
from common.responses import success_response


CATEGORY_TAGS = ["categories"]


@extend_schema_view(list=extend_schema(tags=CATEGORY_TAGS, summary="Listar categorias"))
class AuctionCategoryViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    required_permissions = ["auction.read"]

    def list(self, request):
        categories = list_categories()
        serializer = AuctionCategorySerializer(categories, many=True)
        return success_response(serializer.data)
