from django.contrib import admin

from apps.access.models import ApiKey, OAuthAccount, Session


@admin.register(OAuthAccount)
class OAuthAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "created_at")


@admin.register(ApiKey)
class ApiKeyAdmin(admin.ModelAdmin):
    list_display = ("user", "is_active", "rate_limit_per_minute", "created_at")
    list_filter = ("is_active",)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "created_at")
