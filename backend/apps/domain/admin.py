from django.contrib import admin

from apps.domain.models import Domain


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "status", "budget", "is_archived", "created_at")
    list_filter = ("status", "is_archived")
    search_fields = ("name", "description", "owner__email")
