from rest_framework import serializers

from apps.storage.models import File


class FileBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ("id", "url", "mime_type", "size")
