from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.reports.selectors import get_report, list_my_reports, list_reports
from apps.reports.serializers import (
    ReportActionCreateSerializer,
    ReportCreateSerializer,
    ReportListSerializer,
    ReportSerializer,
    ReportStatusUpdateSerializer,
)
from apps.reports.services import apply_report_action, create_report
from apps.users.permissions.rbac import HasRBACPermission
from common.responses import error_response, success_response
from rest_framework.exceptions import ValidationError, PermissionDenied

REPORTS_TAGS = ["reports"]


@extend_schema_view(
    create=extend_schema(tags=REPORTS_TAGS, summary="Submeter uma denúncia"),
    list=extend_schema(tags=REPORTS_TAGS, summary="Listar todas as denúncias (Admin)"),
    retrieve=extend_schema(tags=REPORTS_TAGS, summary="Detalhar denúncia (Admin)"),
    partial_update=extend_schema(tags=REPORTS_TAGS, summary="Alterar status da denúncia (Admin)"),
)
class ReportViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, HasRBACPermission]
    serializer_class = ReportSerializer

    @property
    def required_permissions(self):
        action_map = {
            "create": ["report.create"],
            "list": ["report.review"],
            "retrieve": ["report.review"],
            "partial_update": ["report.resolve"],
            "apply_action": ["report.resolve"],
            "my_reports": [],
        }
        return action_map.get(self.action, [])


    def create(self, request: Request):
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            report = create_report(
                reporter=request.user,
                **serializer.validated_data,
            )
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            if isinstance(detail, list):
                detail = str(detail[0])
            elif isinstance(detail, dict):
                detail = str(next(iter(detail.values())))
            else:
                detail = str(detail)
            return error_response(
                errors={"detail": detail},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=ReportSerializer(report).data,
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(tags=REPORTS_TAGS, summary="Listar denúncias do utilizador autenticado")
    @action(detail=False, methods=["get"], url_path="mine")
    def my_reports(self, request: Request):
        reports = list_my_reports(user=request.user)
        return success_response(
            data=ReportListSerializer(reports, many=True).data
        )


    def list(self, request: Request):
        qs = list_reports(
            status=request.query_params.get("status"),
            target_type=request.query_params.get("target_type"),
        )
        return success_response(
            data=ReportListSerializer(qs, many=True).data
        )

    def retrieve(self, request: Request, pk=None): 
        report = get_report(report_id=int(pk))
        if not report:
            return error_response(
                errors={"detail": "Denúncia não encontrada."},
                status_code=status.HTTP_404_NOT_FOUND,
            )
        return success_response(data=ReportSerializer(report).data)

    def partial_update(self, request: Request, pk=None):
        serializer = ReportStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            apply_report_action(
                report_id=int(pk),
                admin=request.user,
                action="CHANGE_STATUS",
                note=serializer.validated_data.get("note", ""),
                new_status=serializer.validated_data["status"],
            )
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            if isinstance(detail, list):
                detail = str(detail[0])
            elif isinstance(detail, dict):
                detail = str(next(iter(detail.values())))
            else:
                detail = str(detail)
            return error_response(
                errors={"detail": detail},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        report = get_report(report_id=int(pk))
        return success_response(data=ReportSerializer(report).data)

    @extend_schema(tags=REPORTS_TAGS, summary="Aplicar acção administrativa")
    @action(detail=True, methods=["post"], url_path="action")
    def apply_action(self, request: Request, pk=None):
        serializer = ReportActionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            report_action = apply_report_action(
                report_id=int(pk),
                admin=request.user,
                **serializer.validated_data,
            )
        except (ValidationError, PermissionDenied) as exc:
            detail = exc.detail if hasattr(exc, "detail") else str(exc)
            if isinstance(detail, list):
                detail = str(detail[0])
            elif isinstance(detail, dict):
                detail = str(next(iter(detail.values())))
            else:
                detail = str(detail)
            return error_response(
                errors={"detail": detail},
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data=ReportSerializer(get_report(report_id=int(pk))).data,
            status_code=status.HTTP_201_CREATED,
        )
        