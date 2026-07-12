from rest_framework import serializers

from apps.access.models import ApiKey, OAuthAccount, Session
from common.fields import LocalizedModelSerializer


class OAuthAccountSerializer(LocalizedModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = ("id", "user", "provider", "provider_user_id", "created_at")


class ApiKeySerializer(LocalizedModelSerializer):
    class Meta:
        model = ApiKey
        fields = ("id", "user", "api_key", "is_active", "rate_limit_per_minute", "created_at")


class SessionSerializer(LocalizedModelSerializer):
    class Meta:
        model = Session
        fields = ("id", "user", "token", "ip_address", "user_agent", "expires_at", "created_at")
