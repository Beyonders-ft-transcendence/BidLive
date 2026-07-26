import pytest
from rest_framework.test import APIClient

from apps.auctions.models import AuctionCategory
from apps.users.models import Permission, Role, RolePermission, UserRole
from apps.users.selectors import invalidate_user_permissions_cache


def _grant_permissions(user, permissions):
    role, _ = Role.objects.get_or_create(name="CATEGORY_TEST_ROLE")
    for name in permissions:
        permission, _ = Permission.objects.get_or_create(name=name)
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)


def _category_client(user, permissions):
    _grant_permissions(user, permissions)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def category(db):
    category, _ = AuctionCategory.objects.get_or_create(
        slug="test-collectibles",
        defaults={
            "name": "Test Collectibles",
            "description": "Rare items",
            "sort_order": 99,
        },
    )
    return category


def test_category_list_requires_permission(db, user):
    _grant_permissions(user, ["auction.read"])
    AuctionCategory.objects.get_or_create(name="Gaming", slug="gaming")

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert len(response.data["data"]) >= 1


def test_category_crud_flow(db, user, category):
    client = _category_client(user, ["auction.read", "auction.update"])

    detail_response = client.get(f"/api/categories/{category.id}/")
    assert detail_response.status_code == 200
    assert detail_response.data["data"]["slug"] == category.slug

    create_response = client.post(
        "/api/categories/",
        {
            "name": "Vintage Toys",
            "description": "Retro toys",
            "sort_order": 2,
        },
        format="json",
    )
    assert create_response.status_code == 201
    created_id = create_response.data["data"]["id"]
    assert create_response.data["data"]["slug"] == "vintage-toys"

    patch_response = client.patch(
        f"/api/categories/{created_id}/",
        {"description": "Updated description"},
        format="json",
    )
    assert patch_response.status_code == 200
    assert patch_response.data["data"]["description"] == "Updated description"

    put_response = client.put(
        f"/api/categories/{created_id}/",
        {
            "name": "Vintage Toys Plus",
            "slug": "vintage-toys-plus",
            "description": "Full update",
            "parent": None,
            "is_active": True,
            "sort_order": 3,
        },
        format="json",
    )
    assert put_response.status_code == 200
    assert put_response.data["data"]["name"] == "Vintage Toys Plus"

    delete_response = client.delete(f"/api/categories/{created_id}/")
    assert delete_response.status_code == 204
    assert not AuctionCategory.objects.filter(pk=created_id).exists()


def test_category_create_requires_update_permission(db, user):
    client = _category_client(user, ["auction.read"])

    response = client.post(
        "/api/categories/",
        {"name": "Denied", "slug": "denied"},
        format="json",
    )
    assert response.status_code == 403


def test_category_delete_with_children_is_blocked(db, user, category):
    child = AuctionCategory.objects.create(name="Child", slug="child", parent=category)
    client = _category_client(user, ["auction.update"])

    response = client.delete(f"/api/categories/{category.id}/")
    assert response.status_code == 400
    assert AuctionCategory.objects.filter(pk=category.id).exists()
    assert AuctionCategory.objects.filter(pk=child.id).exists()
