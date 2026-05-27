from typing import Iterable

from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.auctions.models import AuctionImage, AuctionItem
from apps.storage.services import save_uploaded_file


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


def validate_images(images: Iterable, *, existing_count: int = 0) -> None:
    images = list(images)
    if existing_count + len(images) > _max_image_count():
        raise ValidationError({"images": ["Image limit exceeded."]})
    allowed = _allowed_mime_types()
    max_size = _max_image_size()
    for image in images:
        if image.content_type not in allowed:
            raise ValidationError({"images": ["Unsupported image type."]})
        if image.size and image.size > max_size:
            raise ValidationError({"images": ["Image too large."]})


def attach_images(*, item: AuctionItem, uploader, images: Iterable) -> list[AuctionImage]:
    images = list(images)
    if not images:
        return []
    existing_count = item.images.count()
    validate_images(images, existing_count=existing_count)
    created_images: list[AuctionImage] = []
    for index, image in enumerate(images):
        file_obj = save_uploaded_file(uploader=uploader, uploaded_file=image, prefix="auctions")
        created_images.append(
            AuctionImage.objects.create(
                item=item,
                file=file_obj,
                is_primary=(existing_count == 0 and index == 0),
                sort_order=existing_count + index,
            )
        )
    return created_images


def set_primary_image(*, item: AuctionItem, image_id: int) -> None:
    AuctionImage.objects.filter(item=item).update(is_primary=False)
    AuctionImage.objects.filter(item=item, id=image_id).update(is_primary=True)
