from rest_framework import serializers

from apps.reports.models import Report, ReportAction, ReportEvidence


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ("id", "reporter", "target_type", "target_id", "reason", "status", "created_at")


class ReportActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAction
        fields = ("id", "report", "admin", "action", "note", "created_at")


class ReportEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportEvidence
        fields = ("id", "report", "file", "created_at")
