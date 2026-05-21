import uuid
from pathlib import Path

from django.core.files.storage import default_storage

from apps.storage.models import File


def save_uploaded_file(*, uploader, uploaded_file, prefix: str = "uploads") -> File:
    safe_name = Path(uploaded_file.name).name
    object_name = f"{prefix}/{uuid.uuid4().hex}_{safe_name}"
    stored_path = default_storage.save(object_name, uploaded_file)
    return File.objects.create(
        uploader=uploader,
        file_name=Path(stored_path).name,
        original_name=safe_name,
        mime_type=getattr(uploaded_file, "content_type", ""),
        size=getattr(uploaded_file, "size", None),
        url=default_storage.url(stored_path),
    )
