from rest_framework import serializers

from apps.domain.models import Domain


class DomainSerializer(serializers.ModelSerializer):
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
