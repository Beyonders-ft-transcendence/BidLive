from django.db.models import QuerySet

from apps.reports.models import Report, ReportStatus
from apps.users.models import User


def list_reports(
    *,
    status: str | None = None,
    target_type: str | None = None,
    reporter: User | None = None,
) -> QuerySet[Report]:
    qs = Report.objects.select_related("reporter").prefetch_related("actions", "evidence")

    if status:
        qs = qs.filter(status=status)
    if target_type:
        qs = qs.filter(target_type=target_type)
    if reporter:
        qs = qs.filter(reporter=reporter)

    return qs


def get_report(*, report_id: int) -> Report | None:
    return (
        Report.objects.select_related("reporter")
        .prefetch_related("actions__admin", "evidence__file")
        .filter(id=report_id)
        .first()
    )


def list_my_reports(*, user: User) -> QuerySet[Report]:
    return Report.objects.filter(reporter=user).order_by("-created_at")
