from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APIClient

from apps.auctions.models import AuctionCategory
from apps.users.models import Permission, Role, RolePermission, User, UserRole
from apps.users.selectors import invalidate_user_permissions_cache


def _grant_permissions(user, permissions):
    role, _ = Role.objects.get_or_create(name="AUCTION_TEST_ROLE")
    for name in permissions:
        permission, _ = Permission.objects.get_or_create(name=name)
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)


def test_auction_create_update_cancel_flow(db, user):
    _grant_permissions(user, ["auction.create", "auction.read", "auction.update", "auction.cancel"])
    category, _ = AuctionCategory.objects.get_or_create(name="Electronics", slug="electronics")

    client = APIClient()
    client.force_authenticate(user=user)

    start_time = timezone.now() + timedelta(hours=2)
    end_time = start_time + timedelta(hours=2)

    response = client.post(
        "/api/auctions/",
        {
            "title": "Camera",
            "description": "DSLR",
            "category_id": category.id,
            "condition_type": "NEW",
            "starting_price": "100.00",
            "minimum_increment": "5.00",
            "buy_now_price": "300.00",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        },
        format="multipart",
    )

    assert response.status_code == 201
    auction_id = response.data["data"]["id"]

    update_response = client.patch(
        f"/api/auctions/{auction_id}/",
        {"description": "Updated", "buy_now_price": "350.00"},
        format="multipart",
    )

    assert update_response.status_code == 200
    assert update_response.data["data"]["item"]["description"] == "Updated"

    cancel_response = client.post(
        f"/api/auctions/{auction_id}/cancel/",
        {"reason": "Changed plans"},
        format="json",
    )

    assert cancel_response.status_code == 200
    assert cancel_response.data["data"]["status"] == "CANCELLED"


def test_auction_bid_and_buy_now(db, user):
    _grant_permissions(user, ["auction.create", "auction.read"])
    category, _ = AuctionCategory.objects.get_or_create(name="Art", slug="art")

    client = APIClient()
    client.force_authenticate(user=user)

    start_time = timezone.now() - timedelta(minutes=5)
    end_time = timezone.now() + timedelta(hours=1)

    create_response = client.post(
        "/api/auctions/",
        {
            "title": "Painting",
            "description": "Oil",
            "category_id": category.id,
            "condition_type": "USED",
            "starting_price": "50.00",
            "minimum_increment": "5.00",
            "buy_now_price": "120.00",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        },
        format="multipart",
    )
    auction_id = create_response.data["data"]["id"]

    bidder, _ = User.objects.get_or_create(
        email="bidder@example.com",
        defaults={"username": "bidder", "full_name": "Bidder User"},
    )
    _grant_permissions(bidder, ["auction.read", "auction.buy_now"])
    bidder_client = APIClient()
    bidder_client.force_authenticate(user=bidder)

    bid_response = bidder_client.post(
        f"/api/auctions/{auction_id}/bids/",
        {"amount": "55.00"},
        format="json",
    )
    assert bid_response.status_code == 200
    assert bid_response.data["data"]["amount"] == "55.00"

    buy_now_response = bidder_client.post(
        f"/api/auctions/{auction_id}/buy-now/",
        {},
        format="json",
    )
    assert buy_now_response.status_code == 200
    assert buy_now_response.data["data"]["status"] == "SOLD"


def test_auction_watch_toggle(db, user):
    _grant_permissions(user, ["auction.create", "auction.read", "auction.watch"])
    category, _ = AuctionCategory.objects.get_or_create(name="Fashion", slug="fashion")

    client = APIClient()
    client.force_authenticate(user=user)

    start_time = timezone.now() + timedelta(hours=1)
    end_time = start_time + timedelta(hours=2)

    create_response = client.post(
        "/api/auctions/",
        {
            "title": "Jacket",
            "description": "Leather",
            "category_id": category.id,
            "condition_type": "USED",
            "starting_price": "80.00",
            "minimum_increment": "10.00",
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
        },
        format="multipart",
    )

    auction_id = create_response.data["data"]["id"]

    watch_response = client.post(f"/api/auctions/{auction_id}/watch/", {}, format="json")
    assert watch_response.status_code == 200

    unwatch_response = client.delete(f"/api/auctions/{auction_id}/watch/")
    assert unwatch_response.status_code == 200


def test_category_list_requires_permission(db, user):
    _grant_permissions(user, ["auction.read"])
    AuctionCategory.objects.get_or_create(name="Gaming", slug="gaming")

    client = APIClient()
    client.force_authenticate(user=user)

    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert len(response.data["data"]) >= 1
