import uuid
from pathlib import Path
from urllib.parse import urlparse

from django.core.files.storage import default_storage
from rest_framework.exceptions import ValidationError

from apps.storage.models import File


def is_http_url(value: str) -> bool:
    return isinstance(value, str) and value.startswith(("http://", "https://"))


def _guess_mime_type(file_name: str) -> str:
    extension = Path(file_name).suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }
    return mime_types.get(extension, "application/octet-stream")


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


def save_external_file_url(*, uploader, url: str) -> File:
    if not is_http_url(url):
        raise ValidationError({"url": ["External file URL must start with http:// or https://."]})

    parsed_name = Path(urlparse(url).path).name or "external-asset"
    return File.objects.create(
        uploader=uploader,
        file_name=parsed_name,
        original_name=parsed_name,
        mime_type=_guess_mime_type(parsed_name),
        size=None,
        url=url,
    )


def resolve_file_reference(
    *,
    uploader,
    uploaded_file=None,
    file_url: str | None = None,
    prefix: str = "uploads",
) -> File:
    if uploaded_file is not None:
        return save_uploaded_file(uploader=uploader, uploaded_file=uploaded_file, prefix=prefix)
    if file_url:
        return save_external_file_url(uploader=uploader, url=file_url)
    raise ValidationError({"file": ["Provide a file upload or an http(s) URL."]})
