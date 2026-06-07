from django.utils.text import slugify
from rest_framework.exceptions import ValidationError

from apps.auctions.models import AuctionCategory


def _ensure_unique_slug(*, slug: str, exclude_id: int | None = None) -> str:
    base_slug = slug
    counter = 1
    while AuctionCategory.objects.filter(slug=slug).exclude(pk=exclude_id).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def _resolve_slug(*, name: str, slug: str | None) -> str:
    resolved = (slug or "").strip() or slugify(name)
    if not resolved:
        raise ValidationError({"slug": ["Slug is required when name cannot be slugified."]})
    return resolved


def _validate_parent(*, category: AuctionCategory | None, parent: AuctionCategory | None) -> None:
    if parent is None:
        return
    if category is not None and parent.pk == category.pk:
        raise ValidationError({"parent": ["A category cannot be its own parent."]})
    ancestor = parent
    while ancestor is not None:
        if category is not None and ancestor.pk == category.pk:
            raise ValidationError({"parent": ["Circular parent chain is not allowed."]})
        ancestor = ancestor.parent


def create_category(*, data: dict) -> AuctionCategory:
    payload = data.copy()
    name = payload["name"]
    slug = _resolve_slug(name=name, slug=payload.pop("slug", None))
    slug = _ensure_unique_slug(slug=slug)
    parent = payload.get("parent")
    _validate_parent(category=None, parent=parent)
    return AuctionCategory.objects.create(slug=slug, **payload)


def update_category(
    *,
    category: AuctionCategory,
    data: dict,
    partial: bool = True,
) -> AuctionCategory:
    payload = data.copy()
    if "parent" in payload:
        _validate_parent(category=category, parent=payload.get("parent"))
    if "slug" in payload or ("name" in payload and not partial):
        name = payload.get("name", category.name)
        provided_slug = payload.get("slug") if "slug" in payload else None
        slug = _resolve_slug(name=name, slug=provided_slug)
        payload["slug"] = _ensure_unique_slug(slug=slug, exclude_id=category.id)
    for field, value in payload.items():
        setattr(category, field, value)
    category.save(update_fields=None)
    return category


def delete_category(*, category: AuctionCategory) -> None:
    if category.children.exists():
        raise ValidationError({"category": ["Cannot delete a category that has child categories."]})
    category.delete()
