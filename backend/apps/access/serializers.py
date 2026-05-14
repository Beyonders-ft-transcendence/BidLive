from rest_framework import serializers

from apps.access.models import ApiKey, OAuthAccount, Session


class OAuthAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = ("id", "user", "provider", "provider_user_id", "created_at")


class ApiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiKey
        fields = ("id", "user", "api_key", "is_active", "rate_limit_per_minute", "created_at")


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ("id", "user", "token", "ip_address", "user_agent", "expires_at", "created_at")
