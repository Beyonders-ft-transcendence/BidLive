from rest_framework import serializers

from apps.storage.models import File


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ("id", "uploader", "file_name", "original_name", "mime_type", "size", "url", "created_at")
