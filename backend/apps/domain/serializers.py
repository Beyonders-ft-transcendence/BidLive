from rest_framework import serializers

from apps.domain.models import Domain
from common.fields import LocalizedModelSerializer


class DomainSerializer(LocalizedModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Domain
        fields = (
            "id",
            "owner",
            "owner_email",
            "name",
            "description",
            "status",
            "budget",
            "is_archived",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner", "owner_email", "created_at", "updated_at")
