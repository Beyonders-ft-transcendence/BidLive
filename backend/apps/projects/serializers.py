from rest_framework import serializers

from apps.projects.models import Project


class ProjectSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Project
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
