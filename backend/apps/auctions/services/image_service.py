from collections.abc import Iterable

from django.conf import settings
from rest_framework.exceptions import ValidationError

from apps.auctions.models import AuctionImage, AuctionItem
from apps.storage.services import is_http_url, save_external_file_url, save_uploaded_file


def _max_image_count() -> int:
    return int(getattr(settings, "AUCTION_IMAGE_MAX_COUNT", 8))


def attach_images(
    *,
    item: AuctionItem,
    image_urls: Iterable[str] | None = None,
) -> list[AuctionImage]:
    urls = list(image_urls or [])
    if not urls:
        return []

    existing_count = item.images.count()
    if existing_count + len(urls) > _max_image_count():
        raise ValidationError({"images": ["Image limit exceeded."]})

    created_images: list[AuctionImage] = []
    next_sort_order = existing_count

    for index, image_url in enumerate(urls):
        created_images.append(
            AuctionImage.objects.create(
                item=item,
                image_url=image_url,
                is_primary=(existing_count == 0 and index == 0),
                sort_order=next_sort_order,
            )
        )
        next_sort_order += 1

    return created_images


def set_primary_image(*, item: AuctionItem, image_id: int) -> None:
    AuctionImage.objects.filter(item=item).update(is_primary=False)
    AuctionImage.objects.filter(item=item, id=image_id).update(is_primary=True)
