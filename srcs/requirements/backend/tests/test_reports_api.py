import pytest

from apps.reports.models import Report, ReportAction, ReportStatus, ReportTargetType
from apps.users.models import UserStatus


# AUTHENTICATION

@pytest.mark.django_db
class TestAuthenticationRequired:

    def test_create_report_requires_auth(self, api_client, other_user):
        res = api_client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "SPAM"},
            format="json",
        )
        assert res.status_code == 401

    def test_list_reports_requires_auth(self, api_client):
        res = api_client.get("/api/reports/")
        assert res.status_code == 401

    def test_retrieve_report_requires_auth(self, api_client, report):
        res = api_client.get(f"/api/reports/{report.id}/")
        assert res.status_code == 401

    def test_patch_report_requires_auth(self, api_client, report):
        res = api_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "UNDER_REVIEW"},
            format="json",
        )
        assert res.status_code == 401

    def test_apply_action_requires_auth(self, api_client, report):
        res = api_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "COMMENT", "note": "test"},
            format="json",
        )
        assert res.status_code == 401

    def test_my_reports_requires_auth(self, api_client):
        res = api_client.get("/api/reports/mine/")
        assert res.status_code == 401


# RBAC - user without permission

@pytest.mark.django_db
class TestRBACPermissions:

    def test_user_without_permission_cannot_list_reports(self, auth_client):
        res = auth_client.get("/api/reports/")
        assert res.status_code == 403

    def test_user_without_permission_cannot_retrieve_report(self, auth_client, report):
        res = auth_client.get(f"/api/reports/{report.id}/")
        assert res.status_code == 403

    def test_user_without_permission_cannot_patch_report(self, auth_client, report):
        res = auth_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "RESOLVED"},
            format="json",
        )
        assert res.status_code == 403

    def test_user_without_permission_cannot_apply_action(self, auth_client, report):
        res = auth_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "COMMENT", "note": "test"},
            format="json",
        )
        assert res.status_code == 403

    def test_user_without_report_create_cannot_submit(self, auth_client, other_user):
        res = auth_client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "SPAM"},
            format="json",
        )
        assert res.status_code == 403


# SUBMIT REPORT

@pytest.mark.django_db
class TestCreateReport:

    def test_create_report_success(self, user_with_report_create, other_user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post(
            "/api/reports/",
            {
                "target_type": "USER",
                "target_id": other_user.id,
                "reason": "SPAM",
                "description": "Comportamento suspeito.",
            },
            format="json",
        )
        assert res.status_code == 201
        assert res.data["success"] is True
        assert res.data["data"]["status"] == ReportStatus.OPEN

    def test_create_report_creates_db_record(self, user_with_report_create, other_user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "SCAM"},
            format="json",
        )
        assert Report.objects.filter(
            reporter=user_with_report_create,
            target_type="USER",
            target_id=other_user.id,
        ).exists()

    def test_create_report_without_description(self, user_with_report_create, other_user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "FRAUD"},
            format="json",
        )
        assert res.status_code == 201

    def test_create_duplicate_report_fails(self, user_with_report_create, other_user, report):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "SPAM"},
            format="json",
        )
        assert res.status_code == 400

    def test_create_report_invalid_target_type(self, user_with_report_create, other_user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post(
            "/api/reports/",
            {"target_type": "INVALID", "target_id": other_user.id, "reason": "SPAM"},
            format="json",
        )
        assert res.status_code == 400

    def test_create_report_invalid_reason(self, user_with_report_create, other_user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post(
            "/api/reports/",
            {"target_type": "USER", "target_id": other_user.id, "reason": "INVALID"},
            format="json",
        )
        assert res.status_code == 400

    def test_create_report_missing_fields(self, user_with_report_create):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.post("/api/reports/", {}, format="json")
        assert res.status_code == 400


# MY REPORTS

@pytest.mark.django_db
class TestMyReports:

    def test_my_reports_returns_own_reports(self, user_with_report_create, report):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.get("/api/reports/mine/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 1

    def test_my_reports_empty_when_none(self, user_with_report_create):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user_with_report_create)

        res = client.get("/api/reports/mine/")
        assert res.status_code == 200
        assert res.data["data"] == []

    def test_my_reports_does_not_include_others(
        self, user_with_report_create, report, monitor_client
    ):
        res = monitor_client.get("/api/reports/mine/")
        assert res.status_code == 200
        assert len(res.data["data"]) == 0


# LIST REPORTS (ADMIN)

@pytest.mark.django_db
class TestListReports:

    def test_monitor_can_list_reports(self, monitor_client, report):
        res = monitor_client.get("/api/reports/")
        assert res.status_code == 200
        assert res.data["success"] is True
        assert len(res.data["data"]) >= 1

    def test_list_reports_filter_by_status(self, monitor_client, report, report_resolved):
        res = monitor_client.get("/api/reports/?status=OPEN")
        assert res.status_code == 200
        statuses = [r["status"] for r in res.data["data"]]
        assert all(s == ReportStatus.OPEN for s in statuses)

    def test_list_reports_filter_by_target_type(self, monitor_client, report):
        res = monitor_client.get("/api/reports/?target_type=USER")
        assert res.status_code == 200
        types = [r["target_type"] for r in res.data["data"]]
        assert all(t == ReportTargetType.USER for t in types)

    def test_list_reports_empty(self, monitor_client):
        res = monitor_client.get("/api/reports/")
        assert res.status_code == 200
        assert res.data["data"] == []


# RETRIEVE REPORT (ADMIN)

@pytest.mark.django_db
class TestRetrieveReport:

    def test_retrieve_report_success(self, monitor_client, report):
        res = monitor_client.get(f"/api/reports/{report.id}/")
        assert res.status_code == 200
        assert res.data["data"]["id"] == report.id

    def test_retrieve_report_includes_actions(self, monitor_client, report):
        res = monitor_client.get(f"/api/reports/{report.id}/")
        assert "actions" in res.data["data"]
        assert res.data["data"]["actions"] == []

    def test_retrieve_nonexistent_report(self, monitor_client):
        res = monitor_client.get("/api/reports/99999/")
        assert res.status_code == 404


# PATCH - CHANGE STATUS

@pytest.mark.django_db
class TestPatchReportStatus:

    def test_patch_status_to_under_review(self, monitor_client, report):
        res = monitor_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "UNDER_REVIEW"},
            format="json",
        )
        assert res.status_code == 200
        assert res.data["data"]["status"] == ReportStatus.UNDER_REVIEW

    def test_patch_status_updates_db(self, monitor_client, report):
        monitor_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "RESOLVED"},
            format="json",
        )
        report.refresh_from_db()
        assert report.status == ReportStatus.RESOLVED

    def test_patch_status_creates_action_record(self, monitor_client, report):
        monitor_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "REJECTED", "note": "Sem evidência suficiente."},
            format="json",
        )
        assert ReportAction.objects.filter(
            report=report, action="CHANGE_STATUS"
        ).exists()

    def test_patch_invalid_status(self, monitor_client, report):
        res = monitor_client.patch(
            f"/api/reports/{report.id}/",
            {"status": "INVALID_STATUS"},
            format="json",
        )
        assert res.status_code == 400

    def test_patch_missing_status(self, monitor_client, report):
        res = monitor_client.patch(
            f"/api/reports/{report.id}/",
            {},
            format="json",
        )
        assert res.status_code == 400


# APPLY ACTION - COMMENT

@pytest.mark.django_db
class TestActionComment:

    def test_comment_success(self, monitor_client, monitor_user, report):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "COMMENT", "note": "A analisar o caso."},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["success"] is True

    def test_comment_creates_action_record(self, monitor_client, monitor_user, report):
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "COMMENT", "note": "Nota de moderação."},
            format="json",
        )
        assert ReportAction.objects.filter(
            report=report, action="COMMENT", admin=monitor_user
        ).exists()

    def test_comment_does_not_change_status(self, monitor_client, report):
        original_status = report.status
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "COMMENT", "note": "só um comentário"},
            format="json",
        )
        report.refresh_from_db()
        assert report.status == original_status

    def test_comment_on_resolved_report_is_allowed(self, monitor_client, report_resolved):
        res = monitor_client.post(
            f"/api/reports/{report_resolved.id}/action/",
            {"action": "COMMENT", "note": "Arquivado."},
            format="json",
        )
        assert res.status_code == 201


# APPLY ACTION - CHANGE_STATUS

@pytest.mark.django_db
class TestActionChangeStatus:

    def test_change_status_success(self, monitor_client, report):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "CHANGE_STATUS", "new_status": "UNDER_REVIEW"},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["data"]["status"] == ReportStatus.UNDER_REVIEW

    def test_change_status_requires_new_status(self, monitor_client, report):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "CHANGE_STATUS"},
            format="json",
        )
        assert res.status_code == 400

    def test_non_comment_action_on_resolved_fails(self, monitor_client, report_resolved):
        res = monitor_client.post(
            f"/api/reports/{report_resolved.id}/action/",
            {"action": "CHANGE_STATUS", "new_status": "OPEN"},
            format="json",
        )
        assert res.status_code == 400


# APPLY ACTION - WARN_USER

@pytest.mark.django_db
class TestActionWarnUser:

    def test_warn_user_success(self, monitor_client, report):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "WARN_USER", "note": "Aviso emitido."},
            format="json",
        )
        assert res.status_code == 201
        assert res.data["success"] is True

    def test_warn_user_creates_action_record(self, monitor_client, report):
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "WARN_USER"},
            format="json",
        )
        assert ReportAction.objects.filter(
            report=report, action="WARN_USER"
        ).exists()


# APPLY ACTION - BAN_USER

@pytest.mark.django_db
class TestActionBanUser:

    def test_ban_user_success(self, monitor_client, report, other_user):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "BAN_USER", "note": "Banido por spam."},
            format="json",
        )
        assert res.status_code == 201
        other_user.refresh_from_db()
        assert other_user.status == UserStatus.BANNED
        assert other_user.is_active is False

    def test_ban_user_resolves_report(self, monitor_client, report):
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "BAN_USER"},
            format="json",
        )
        report.refresh_from_db()
        assert report.status == ReportStatus.RESOLVED

    def test_ban_user_on_non_user_report_fails(self, monitor_client, report_message):
        res = monitor_client.post(
            f"/api/reports/{report_message.id}/action/",
            {"action": "BAN_USER"},
            format="json",
        )
        assert res.status_code == 400

    def test_ban_already_banned_user_fails(self, monitor_client, report, other_user):
        other_user.status = UserStatus.BANNED
        other_user.save(update_fields=["status"])

        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "BAN_USER"},
            format="json",
        )
        assert res.status_code == 400


# APPLY ACTION - DELETE_CONTENT

@pytest.mark.django_db
class TestActionDeleteContent:

    def test_delete_content_message_success(
        self, monitor_client, report_message, room_message
    ):
        res = monitor_client.post(
            f"/api/reports/{report_message.id}/action/",
            {"action": "DELETE_CONTENT", "note": "Conteúdo inapropriado."},
            format="json",
        )
        assert res.status_code == 201
        room_message.refresh_from_db()
        assert room_message.is_deleted is True

    def test_delete_content_resolves_report(self, monitor_client, report_message):
        monitor_client.post(
            f"/api/reports/{report_message.id}/action/",
            {"action": "DELETE_CONTENT"},
            format="json",
        )
        report_message.refresh_from_db()
        assert report_message.status == ReportStatus.RESOLVED


# APPLY ACTION - ESCALATE

@pytest.mark.django_db
class TestActionEscalate:

    def test_escalate_success(self, monitor_client, report):
        res = monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "ESCALATE", "note": "Requer revisão de nível superior."},
            format="json",
        )
        assert res.status_code == 201

    def test_escalate_sets_under_review(self, monitor_client, report):
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "ESCALATE"},
            format="json",
        )
        report.refresh_from_db()
        assert report.status == ReportStatus.UNDER_REVIEW

    def test_escalate_creates_action_record(self, monitor_client, report):
        monitor_client.post(
            f"/api/reports/{report.id}/action/",
            {"action": "ESCALATE"},
            format="json",
        )
        assert ReportAction.objects.filter(
            report=report, action="ESCALATE"
        ).exists()
