from django.contrib import admin

from apps.reports.models import Report, ReportAction, ReportEvidence


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("reporter", "target_type", "target_id", "status", "created_at")
    list_filter = ("status", "target_type")


@admin.register(ReportAction)
class ReportActionAdmin(admin.ModelAdmin):
    list_display = ("report", "admin", "action", "created_at")


@admin.register(ReportEvidence)
class ReportEvidenceAdmin(admin.ModelAdmin):
    list_display = ("report", "file", "created_at")
