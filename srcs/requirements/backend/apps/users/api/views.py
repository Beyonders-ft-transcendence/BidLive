from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from common.exceptions import ConflictError
from common.responses import error_response, success_response
from apps.users.api.serializers import (
    PermissionSerializer,
    PermissionWriteSerializer,
    RoleSerializer,
    RoleWriteSerializer,
    UserBanSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)
from apps.users.authorization_service import user_has_permission, user_is_super_admin
from apps.users.filters import UserFilter
from apps.users.models import Permission, Role, User
from apps.users.permission_service import (
    create_permission,
    delete_permission,
    serialize_permission,
    update_permission,
)
from apps.users.permissions.rbac import HasRBACPermission, RBACPermissionMixin
from apps.users.role_service import create_role, delete_role, serialize_role, update_role
from apps.users.selectors import get_permission_by_id, get_role_by_id, get_user_by_id, list_permissions, list_roles
from apps.users.user_service import (
    ban_user,
    create_managed_user,
    hard_delete_user,
    serialize_user_detail,
    soft_delete_user,
    update_managed_user,
)


def _client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


RBAC_TAGS = ["rbac"]


@extend_schema_view(
    list=extend_schema(tags=RBAC_TAGS, summary="Listar usuarios"),
    retrieve=extend_schema(tags=RBAC_TAGS, summary="Detalhar usuario"),
    create=extend_schema(tags=RBAC_TAGS, summary="Criar usuario"),
    partial_update=extend_schema(tags=RBAC_TAGS, summary="Atualizar usuario"),
    destroy=extend_schema(tags=RBAC_TAGS, summary="Remover usuario (soft delete)"),
)
class UserViewSet(RBACPermissionMixin, viewsets.GenericViewSet):
    serializer_class = UserDetailSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = UserFilter
    search_fields = ["email", "username", "full_name"]
    ordering_fields = ["created_at", "email", "username", "status"]

    def get_serializer_class(self):
        serializer_map = {
            "list": UserListSerializer,
            "retrieve": UserDetailSerializer,
            "create": UserCreateSerializer,
            "partial_update": UserUpdateSerializer,
            "ban": UserBanSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_required_permissions(self):
        action_map = {
            "list": ["user.read"],
            "retrieve": ["user.read"],
            "create": ["user.create"],
            "partial_update": ["user.update"],
            "ban": ["user.ban"],
            "destroy": ["user.delete"],
            "hard_delete": ["user.delete"],
        }
        return action_map.get(self.action, [])

    @property
    def required_permissions(self):
        perms = self.get_required_permissions()
        if self.action == "list":
            return []
        if self.action == "retrieve" and self.kwargs.get("pk") == str(
            getattr(self.request.user, "id", None)
        ):
            return []
        if self.action == "partial_update" and self.kwargs.get("pk") == str(
            getattr(self.request.user, "id", None)
        ):
            return []
        return perms

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()
        queryset = User.objects.filter(is_deleted=False).prefetch_related("roles")
        if user_is_super_admin(user=self.request.user) or user_has_permission(
            user=self.request.user, permission_name="user.read"
        ):
            return queryset
        return queryset.filter(pk=self.request.user.pk)

    def list(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = UserListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return success_response(serializer.data)

    def retrieve(self, request, pk=None):
        user = get_object_or_404(self.get_queryset(), pk=pk)
        if str(user.id) != str(request.user.id) and not user_has_permission(
            user=request.user, permission_name="user.read"
        ):
            raise PermissionDenied({"permission": ["Permissao user.read necessaria."]})
        return success_response(serialize_user_detail(user=user))

    def create(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        role_names = data.pop("role_names", None)
        password = data.pop("password")
        try:
            user = create_managed_user(
                actor=request.user,
                password=password,
                role_names=role_names,
                ip_address=_client_ip(request),
                **data,
            )
        except ConflictError as exc:
            return error_response(exc.detail, status_code=status.HTTP_409_CONFLICT)
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(
            serialize_user_detail(user=user),
            message="Usuario criado com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        user = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        if "role_names" in data:
            data["role_names"] = data.pop("role_names")
        try:
            user = update_managed_user(
                actor=request.user,
                user=user,
                data=data,
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(serialize_user_detail(user=user), message="Usuario atualizado.")

    @extend_schema(
        tags=RBAC_TAGS,
        summary="Banir ou suspender usuario",
        request=UserBanSerializer,
        responses={200: OpenApiResponse(description="Status atualizado.")},
    )
    @action(detail=True, methods=["post"], url_path="ban")
    def ban(self, request, pk=None):
        user = get_object_or_404(User.objects.filter(is_deleted=False), pk=pk)
        serializer = UserBanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = ban_user(
                actor=request.user,
                user=user,
                status=serializer.validated_data["status"],
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(serialize_user_detail(user=user), message="Status do usuario atualizado.")

    def destroy(self, request, pk=None):
        user = get_object_or_404(User.objects.filter(is_deleted=False), pk=pk)
        try:
            soft_delete_user(actor=request.user, user=user, ip_address=_client_ip(request))
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response({}, message="Usuario removido com sucesso.")

    @extend_schema(
        tags=RBAC_TAGS,
        summary="Remover usuario permanentemente (hard delete)",
        responses={200: OpenApiResponse(description="Usuario removido permanentemente.")},
    )
    @action(detail=True, methods=["delete"], url_path="hard-delete")
    def hard_delete(self, request, pk=None):
        user = get_object_or_404(User.objects.all(), pk=pk)
        try:
            hard_delete_user(actor=request.user, user=user, ip_address=_client_ip(request))
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response({}, message="Usuario removido permanentemente com sucesso.")


@extend_schema_view(
    list=extend_schema(tags=RBAC_TAGS, summary="Listar roles"),
    retrieve=extend_schema(tags=RBAC_TAGS, summary="Detalhar role"),
    create=extend_schema(tags=RBAC_TAGS, summary="Criar role"),
    partial_update=extend_schema(tags=RBAC_TAGS, summary="Atualizar role"),
    destroy=extend_schema(tags=RBAC_TAGS, summary="Remover role"),
)
class RoleViewSet(RBACPermissionMixin, viewsets.GenericViewSet):
    required_permissions = ["role.manage"]
    serializer_class = RoleSerializer

    def get_serializer_class(self):
        serializer_map = {
            "list": RoleSerializer,
            "retrieve": RoleSerializer,
            "create": RoleWriteSerializer,
            "partial_update": RoleWriteSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Role.objects.none()
        return list_roles()

    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        roles = page or queryset
        data = [serialize_role(role=role) for role in roles]
        if page is not None:
            return self.get_paginated_response(data)
        return success_response(data)

    def retrieve(self, request, pk=None):
        role = get_role_by_id(role_id=int(pk))
        return success_response(serialize_role(role=role, include_users=True))

    def create(self, request):
        serializer = RoleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            role = create_role(
                actor=request.user,
                name=data["name"],
                description=data.get("description", ""),
                permission_names=data.get("permission_names"),
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(
            serialize_role(role=role),
            message="Role criada com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        role = get_role_by_id(role_id=int(pk))
        serializer = RoleWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            role = update_role(
                actor=request.user,
                role=role,
                data=serializer.validated_data,
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(serialize_role(role=role), message="Role atualizada.")

    def destroy(self, request, pk=None):
        role = get_role_by_id(role_id=int(pk))
        try:
            delete_role(actor=request.user, role=role, ip_address=_client_ip(request))
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response({}, message="Role removida com sucesso.")


@extend_schema_view(
    list=extend_schema(tags=RBAC_TAGS, summary="Listar permissions"),
    retrieve=extend_schema(tags=RBAC_TAGS, summary="Detalhar permission"),
    create=extend_schema(tags=RBAC_TAGS, summary="Criar permission"),
    partial_update=extend_schema(tags=RBAC_TAGS, summary="Atualizar permission"),
    destroy=extend_schema(tags=RBAC_TAGS, summary="Remover permission"),
)
class PermissionViewSet(RBACPermissionMixin, viewsets.GenericViewSet):
    required_permissions = ["permission.manage"]
    serializer_class = PermissionSerializer

    def get_serializer_class(self):
        serializer_map = {
            "list": PermissionSerializer,
            "retrieve": PermissionSerializer,
            "create": PermissionWriteSerializer,
            "partial_update": PermissionWriteSerializer,
        }
        return serializer_map.get(self.action, self.serializer_class)

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Permission.objects.none()
        return list_permissions()

    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        permissions = page or queryset
        data = [serialize_permission(permission=permission) for permission in permissions]
        if page is not None:
            return self.get_paginated_response(data)
        return success_response(data)

    def retrieve(self, request, pk=None):
        permission = get_permission_by_id(permission_id=int(pk))
        return success_response(serialize_permission(permission=permission))

    def create(self, request):
        serializer = PermissionWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            permission = create_permission(
                actor=request.user,
                name=serializer.validated_data["name"],
                description=serializer.validated_data.get("description", ""),
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(
            serialize_permission(permission=permission),
            message="Permission criada com sucesso.",
            status_code=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        permission = get_permission_by_id(permission_id=int(pk))
        serializer = PermissionWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            permission = update_permission(
                actor=request.user,
                permission=permission,
                data=serializer.validated_data,
                ip_address=_client_ip(request),
            )
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response(
            serialize_permission(permission=permission),
            message="Permission atualizada.",
        )

    def destroy(self, request, pk=None):
        permission = get_permission_by_id(permission_id=int(pk))
        try:
            delete_permission(actor=request.user, permission=permission, ip_address=_client_ip(request))
        except (PermissionDenied, ValidationError) as exc:
            status_code = (
                status.HTTP_403_FORBIDDEN
                if isinstance(exc, PermissionDenied)
                else status.HTTP_400_BAD_REQUEST
            )
            return error_response(exc.detail, status_code=status_code)
        return success_response({}, message="Permission removida com sucesso.")
