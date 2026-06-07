from __future__ import annotations

from typing import Any

from rest_framework.exceptions import ValidationError
from rest_framework.request import Request

from apps.storage.services import is_http_url


def _normalize_url_values(value: Any) -> list[str]:
    if value in (None, ""):
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str) and item]
    return []


def _get_request_values(request: Request, key: str) -> list[Any]:
    data = request.data
    if hasattr(data, "getlist"):
        return list(data.getlist(key))
    return _normalize_url_values(data.get(key))


def collect_http_urls(*values: Any) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for value in values:
        for candidate in _normalize_url_values(value):
            if not is_http_url(candidate):
                continue
            if candidate in seen:
                continue
            seen.add(candidate)
            urls.append(candidate)
    return urls


def collect_auction_image_inputs(
    request: Request,
    validated_data: dict,
) -> tuple[list, list[str]]:
    files = list(request.FILES.getlist("images"))
    urls = collect_http_urls(
        validated_data.pop("image_urls", None),
        _get_request_values(request, "image_urls"),
    )

    is_json = "application/json" in (request.content_type or "")
    if is_json:
        for item in _normalize_url_values(request.data.get("images")):
            if not is_http_url(item):
                raise ValidationError(
                    {
                        "images": [
                            "String image values must start with http:// or https://. "
                            "Use multipart upload for binary files."
                        ]
                    }
                )
        urls = collect_http_urls(urls, request.data.get("images"))

    return files, urls


def apply_optional_file_reference(
    *,
    data: dict,
    uploader,
    uploaded_file=None,
    url_field: str = "image_url",
    target_field: str = "thumbnail",
    prefix: str = "uploads",
) -> dict:
    from apps.storage.services import resolve_file_reference

    payload = dict(data)
    file_url = payload.pop(url_field, None)

    if uploaded_file is not None:
        payload[target_field] = resolve_file_reference(
            uploader=uploader,
            uploaded_file=uploaded_file,
            prefix=prefix,
        )
    elif file_url:
        payload[target_field] = resolve_file_reference(
            uploader=uploader,
            file_url=file_url,
            prefix=prefix,
        )
    return payload
