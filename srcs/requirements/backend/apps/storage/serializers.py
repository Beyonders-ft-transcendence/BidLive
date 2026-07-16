from rest_framework import serializers

from apps.storage.models import File
from common.fields import LocalizedModelSerializer


class FileSerializer(LocalizedModelSerializer):
    class Meta:
        model = File
        fields = ("id", "uploader", "file_name", "original_name", "mime_type", "size", "url", "created_at")
