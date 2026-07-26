from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class OAuthProvider(models.TextChoices):
    GOOGLE = "GOOGLE", "Google"
    FORTY_TWO = "42", "42"


class OAuthAccount(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="oauth_accounts")
    provider = models.CharField(max_length=20, choices=OAuthProvider.choices)
    provider_user_id = models.CharField(max_length=255, blank=True)
    access_token = models.TextField(blank=True)
    refresh_token = models.TextField(blank=True)

    class Meta:
        db_table = "oauth_accounts"
        verbose_name = "OAuth Account"
        verbose_name_plural = "OAuth Accounts"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_user_id"],
                name="uniq_oauth_provider_user",
            ),
            models.UniqueConstraint(
                fields=["user", "provider"],
                name="uniq_oauth_user_provider",
            ),
        ]


class ApiKey(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="api_keys")
    api_key = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    rate_limit_per_minute = models.IntegerField(default=60)

    class Meta:
        db_table = "api_keys"
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
        ordering = ["-created_at"]


class Session(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions")
    token = models.TextField()
    refresh_jti = models.CharField(max_length=64, blank=True, db_index=True)
    ip_address = models.CharField(max_length=45, blank=True)
    user_agent = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "sessions"
        verbose_name = "Session"
        verbose_name_plural = "Sessions"
        ordering = ["-created_at"]
