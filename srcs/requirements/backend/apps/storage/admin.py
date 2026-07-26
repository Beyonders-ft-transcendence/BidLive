from django.contrib import admin

from apps.storage.models import File


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ("file_name", "uploader", "mime_type", "size", "created_at")
    search_fields = ("file_name", "original_name", "uploader__email")
