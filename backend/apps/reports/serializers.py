from rest_framework import serializers

from apps.reports.models import (
    Report,
    ReportAction,
    ReportActionType,
    ReportEvidence,
    ReportReason,
    ReportStatus,
    ReportTargetType,
)
from apps.users.models import User


class ReportReporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "full_name", "avatar_url")
        read_only_fields = fields


class ReportActionSerializer(serializers.ModelSerializer):
    admin = ReportReporterSerializer(read_only=True)

    class Meta:
        model = ReportAction
        fields = ("id", "admin", "action", "note", "created_at")
        read_only_fields = fields


class ReportEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportEvidence
        fields = ("id", "file", "created_at")
        read_only_fields = fields


class ReportSerializer(serializers.ModelSerializer):
    reporter = ReportReporterSerializer(read_only=True)
    actions = ReportActionSerializer(many=True, read_only=True)
    evidence = ReportEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = (
            "id",
            "reporter",
            "target_type",
            "target_id",
            "reason",
            "description",
            "status",
            "actions",
            "evidence",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class ReportListSerializer(serializers.ModelSerializer):
    reporter = ReportReporterSerializer(read_only=True)

    class Meta:
        model = Report
        fields = (
            "id",
            "reporter",
            "target_type",
            "target_id",
            "reason",
            "status",
            "created_at",
        )
        read_only_fields = fields


class ReportCreateSerializer(serializers.Serializer):
    target_type = serializers.ChoiceField(choices=ReportTargetType.choices)
    target_id = serializers.IntegerField(min_value=1)
    reason = serializers.ChoiceField(choices=ReportReason.choices)
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        default="",
    )


class ReportActionCreateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=ReportActionType.choices)
    note = serializers.CharField(required=False, allow_blank=True, default="")
    new_status = serializers.ChoiceField(
        choices=ReportStatus.choices,
        required=False,
        allow_null=True,
        default=None,
    )

    def validate(self, attrs):
        if attrs.get("action") == ReportActionType.CHANGE_STATUS:
            if not attrs.get("new_status"):
                raise serializers.ValidationError(
                    {"new_status": "Obrigatório quando action=CHANGE_STATUS."}
                )
        return attrs


class ReportStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            ReportStatus.UNDER_REVIEW,
            ReportStatus.RESOLVED,
            ReportStatus.REJECTED,
            ReportStatus.IGNORED,
        ]
    )
    note = serializers.CharField(required=False, allow_blank=True, default="")
    