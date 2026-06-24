import logging
 
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
 
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user
from apps.reports.models import (
    Report,
    ReportAction,
    ReportActionType,
    ReportStatus,
    ReportTargetType,
)
from apps.users.models import User, UserStatus
 
logger = logging.getLogger(__name__)


@transaction.atomic
def create_report(
    *,
    reporter: User,
    target_type: str,
    target_id: int,
    reason: str,
    description: str = "",
) -> Report:
    if reporter.status == UserStatus.BANNED:
        raise ValidationError("Utilizadores banidos não podem criar denúncias.")

    duplicate = Report.objects.filter(
        reporter=reporter,
        target_type=target_type,
        target_id=target_id,
        status=ReportStatus.OPEN,
    ).exists()

    if duplicate:
        raise ValidationError(
            "Já submeteste uma denúncia em aberto para este conteúdo."
        )

    report = Report.objects.create(
        reporter=reporter,
        target_type=target_type,
        target_id=target_id,
        reason=reason,
        description=description,
        status=ReportStatus.OPEN,
    )

    logger.info(
        f"Report criado — id={report.id} reporter={reporter.email} "
        f"target={target_type}:{target_id} reason={reason}"
    )

    return report


@transaction.atomic
def apply_report_action(
    *,
    report_id: int,
    admin: User,
    action: str,
    note: str = "",
    new_status: str | None = None,
) -> ReportAction:

    try:
        report = Report.objects.select_for_update().get(id=report_id)
    except Report.DoesNotExist:
        raise ValidationError("Denúncia não encontrada.")

    if report.status in (ReportStatus.RESOLVED, ReportStatus.REJECTED):
        if action != ReportActionType.COMMENT:
            raise ValidationError(
                "Esta denúncia já está encerrada. Só é possível adicionar comentários."
            )

    if action == ReportActionType.CHANGE_STATUS:
        if not new_status:
            raise ValidationError("new_status é obrigatório para CHANGE_STATUS.")
        if new_status not in ReportStatus.values:
            raise ValidationError(f"Status inválido: {new_status}")
        report.status = new_status
        report.save(update_fields=["status", "updated_at"])

    elif action == ReportActionType.BAN_USER:
        _execute_ban_user(report=report, admin=admin)
        report.status = ReportStatus.RESOLVED
        report.save(update_fields=["status", "updated_at"])

    elif action == ReportActionType.WARN_USER:
        _execute_warn_user(report=report)

    elif action == ReportActionType.DELETE_CONTENT:
        _execute_delete_content(report=report)
        report.status = ReportStatus.RESOLVED
        report.save(update_fields=["status", "updated_at"])

    elif action == ReportActionType.ESCALATE:
        report.status = ReportStatus.UNDER_REVIEW
        report.save(update_fields=["status", "updated_at"])

    report_action = ReportAction.objects.create(
        report=report,
        admin=admin,
        action=action,
        note=note,
    )

    logger.info(
        f"ReportAction — id={report_action.id} report={report_id} "
        f"admin={admin.email} action={action}"
    )

    return report_action


def _execute_ban_user(*, report: Report, admin: User) -> None:
    if report.target_type != ReportTargetType.USER:
        raise ValidationError(
            "BAN_USER só pode ser aplicado a denúncias de utilizadores."
        )

    try:
        target_user = User.objects.get(id=report.target_id)
    except User.DoesNotExist:
        raise ValidationError("Utilizador alvo não encontrado.")

    if target_user.status == UserStatus.BANNED:
        raise ValidationError("Este utilizador já está banido.")

    if target_user.has_role("SUPER_ADMIN"):
        raise PermissionDenied("Não é possível banir um Super Admin.")

    target_user.status = UserStatus.BANNED
    target_user.is_active = False
    target_user.save(update_fields=["status", "is_active", "updated_at"])

    notify_user(
        user=target_user,
        notification_type=NotificationType.MESSAGE,
        title="A tua conta foi suspensa",
        content="A tua conta foi banida por violação dos termos de serviço.",
    )

    logger.warning(
        f"Utilizador BANIDO — user_id={target_user.id} "
        f"email={target_user.email} por admin={admin.email} "
        f"via report={report.id}"
    )


def _execute_warn_user(*, report: Report) -> None:
    if report.target_type != ReportTargetType.USER:
        return

    try:
        target_user = User.objects.get(id=report.target_id)
    except User.DoesNotExist:
        return

    notify_user(
        user=target_user,
        notification_type=NotificationType.MESSAGE,
        title="Aviso de moderação",
        content=(
            "O teu conteúdo foi sinalizado e está a ser revisto pela nossa equipa. "
            "Continua a respeitar as regras da plataforma."
        ),
    )


def _execute_delete_content(*, report: Report) -> None:
    from apps.chat.models import Message, PrivateMessage

    if report.target_type == ReportTargetType.MESSAGE:
        Message.objects.filter(id=report.target_id).update(is_deleted=True)
        logger.info(f"Message {report.target_id} soft-deleted via report {report.id}")

    elif report.target_type == ReportTargetType.PRIVATE_MESSAGE:
        PrivateMessage.objects.filter(id=report.target_id).delete()
        logger.info(f"PrivateMessage {report.target_id} deleted via report {report.id}")

    else:
        logger.info(
            f"DELETE_CONTENT registado para {report.target_type}:{report.target_id} "
            f"— requer acção manual"
        )
