from collections.abc import Iterable

from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.auctions.models import AuctionImage, AuctionItem
from apps.storage.services import is_http_url, save_external_file_url, save_uploaded_file


def _allowed_mime_types() -> set[str]:
    return set(
        getattr(
            settings,
            "AUCTION_IMAGE_ALLOWED_MIME_TYPES",
            ["image/jpeg", "image/png", "image/webp"],
        )
    )


def _max_image_size() -> int:
    return int(getattr(settings, "AUCTION_IMAGE_MAX_SIZE", 5 * 1024 * 1024))


def _max_image_count() -> int:
    return int(getattr(settings, "AUCTION_IMAGE_MAX_COUNT", 8))


def validate_uploaded_images(
    images: Iterable,
    *,
    existing_count: int = 0,
    extra_count: int = 0,
) -> None:
    images = list(images)
    if existing_count + extra_count + len(images) > _max_image_count():
        raise ValidationError({"images": ["Image limit exceeded."]})
    allowed = _allowed_mime_types()
    max_size = _max_image_size()
    for image in images:
        if image.content_type not in allowed:
            raise ValidationError({"images": ["Unsupported image type."]})
        if image.size and image.size > max_size:
            raise ValidationError({"images": ["Image too large."]})


def validate_image_urls(
    urls: Iterable[str],
    *,
    existing_count: int = 0,
    extra_count: int = 0,
) -> None:
    urls = list(urls)
    if existing_count + extra_count + len(urls) > _max_image_count():
        raise ValidationError({"images": ["Image limit exceeded."]})
    for url in urls:
        if not is_http_url(url):
            raise ValidationError(
                {"image_urls": ["Each image URL must start with http:// or https://."]}
            )


def attach_images(
    *,
    item: AuctionItem,
    uploader,
    images: Iterable | None = None,
    image_urls: Iterable[str] | None = None,
    files: Iterable | None = None,
) -> list[AuctionImage]:
    uploaded_files = list(files if files is not None else images or [])
    urls = list(image_urls or [])
    if not uploaded_files and not urls:
        return []

    existing_count = item.images.count()
    validate_uploaded_images(uploaded_files, existing_count=existing_count, extra_count=len(urls))
    validate_image_urls(urls, existing_count=existing_count, extra_count=len(uploaded_files))

    created_images: list[AuctionImage] = []
    next_sort_order = existing_count

    for index, image in enumerate(uploaded_files):
        file_obj = save_uploaded_file(uploader=uploader, uploaded_file=image, prefix="auctions")
        created_images.append(
            AuctionImage.objects.create(
                item=item,
                file=file_obj,
                is_primary=(existing_count == 0 and index == 0),
                sort_order=next_sort_order,
            )
        )
        next_sort_order += 1

    for index, image_url in enumerate(urls):
        file_obj = save_external_file_url(uploader=uploader, url=image_url)
        created_images.append(
            AuctionImage.objects.create(
                item=item,
                file=file_obj,
                is_primary=(existing_count == 0 and index == 0 and not uploaded_files),
                sort_order=next_sort_order,
            )
        )
        next_sort_order += 1

    return created_images


def set_primary_image(*, item: AuctionItem, image_id: int) -> None:
    AuctionImage.objects.filter(item=item).update(is_primary=False)
    AuctionImage.objects.filter(item=item, id=image_id).update(is_primary=True)
