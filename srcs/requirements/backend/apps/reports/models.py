from django.conf import settings
from django.db import models

from common.models import TimeStampedModel
from apps.storage.models import File


class ReportTargetType(models.TextChoices):
    USER = "USER", "User"
    MESSAGE = "MESSAGE", "Message"
    PRIVATE_MESSAGE = "PRIVATE_MESSAGE", "Private Message"
    AUCTION = "AUCTION", "Auction"
    AUCTION_ITEM = "AUCTION_ITEM", "Auction Item"
    BID = "BID", "Bid"
    STREAM = "STREAM", "Stream"
    FILE = "FILE", "File"


class ReportReason(models.TextChoices):
    SPAM = "SPAM", "Spam"
    HARASSMENT = "HARASSMENT", "Harassment"
    SCAM = "SCAM", "Scam"
    HATE_SPEECH = "HATE_SPEECH", "Hate Speech"
    FRAUD = "FRAUD", "Fraud"
    INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT", "Inappropriate Content"
    COPYRIGHT = "COPYRIGHT", "Copyright"
    OTHER = "OTHER", "Other"


class ReportStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    RESOLVED = "RESOLVED", "Resolved"
    REJECTED = "REJECTED", "Rejected"
    IGNORED = "IGNORED", "Ignored"


class ReportActionType(models.TextChoices):
    COMMENT = "COMMENT", "Comment"
    CHANGE_STATUS = "CHANGE_STATUS", "Change Status"
    WARN_USER = "WARN_USER", "Warn User"
    BAN_USER = "BAN_USER", "Ban User"
    DELETE_CONTENT = "DELETE_CONTENT", "Delete Content"


class Report(TimeStampedModel):
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    target_type = models.CharField(max_length=30, choices=ReportTargetType.choices)
    target_id = models.BigIntegerField()
    reason = models.CharField(max_length=30, choices=ReportReason.choices)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=ReportStatus.choices, default=ReportStatus.OPEN)

    class Meta:
        db_table = "reports"
        verbose_name = "Report"
        verbose_name_plural = "Reports"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["target_type", "target_id"], name="idx_reports_target")]


class ReportAction(TimeStampedModel):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="actions")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="report_actions")
    action = models.CharField(max_length=30, choices=ReportActionType.choices)
    note = models.TextField(blank=True)

    class Meta:
        db_table = "report_actions"
        verbose_name = "Report Action"
        verbose_name_plural = "Report Actions"
        ordering = ["-created_at"]


class ReportEvidence(TimeStampedModel):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="evidence")
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="report_evidence")

    class Meta:
        db_table = "report_evidence"
        verbose_name = "Report Evidence"
        verbose_name_plural = "Report Evidence"
        ordering = ["-created_at"]
