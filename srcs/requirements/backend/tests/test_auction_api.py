import json
from datetime import timedelta

import pytest
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.auctions.models import Auction, AuctionCategory, AuctionStatus
from apps.users.models import Permission, Role, RolePermission, User, UserRole
from apps.users.selectors import invalidate_user_permissions_cache


def _grant_permissions(user, permissions):
    role, _ = Role.objects.get_or_create(name="AUCTION_TEST_ROLE")
    for name in permissions:
        permission, _ = Permission.objects.get_or_create(name=name)
        RolePermission.objects.get_or_create(role=role, permission=permission)
    UserRole.objects.get_or_create(user=user, role=role)
    invalidate_user_permissions_cache(user=user)


def _auction_client(user, permissions):
    _grant_permissions(user, permissions)
    client = APIClient()
    client.force_authenticate(user=user)
    return client



def _valid_create_payload(*, category_id, start_time=None, end_time=None, **overrides):
    start_time = start_time or (timezone.now() + timedelta(hours=2))
    end_time = end_time or (start_time + timedelta(hours=2))
    payload = {
        "title": "Rolex Daytona",
        "description": "Platinum ice blue dial",
        "category_id": category_id,
        "condition_type": "NEW",
        "starting_price": "100.00",
        "minimum_increment": "5.00",
        "reserve_price": "150.00",
        "buy_now_price": "300.00",
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "is_draft": False,
        "rules": {"auto_extend_seconds": 30},
    }
    payload.update(overrides)
    return payload


def _assert_field_error(response, field, expected_fragment):
    assert response.status_code == 400
    assert response.data["success"] is False
    errors = response.data["errors"]
    
    if isinstance(errors, list):
        flat_errors = {}
        for err in errors:
            if isinstance(err, dict):
                flat_errors.update(err)
        errors = flat_errors
        
    assert field in errors
    assert expected_fragment in str(errors[field][0])


def test_auction_create_with_all_parameters(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="Watches", slug="watches")
    client = _auction_client(user, ["auction.create", "auction.read"])

    response = client.post(
        "/api/auctions/",
        {
            **_valid_create_payload(category_id=category.id),
            "image_urls": ["https://example.com/rolex.webp"],
        },
        format="json",
    )

    assert response.status_code == 201
    data = response.data["data"]
    item = data["item"]

    assert data["status"] == "SCHEDULED"
    assert item["title"] == "Rolex Daytona"
    assert item["description"] == "Platinum ice blue dial"
    assert item["category"]["id"] == category.id
    assert item["condition_type"] == "NEW"
    assert item["starting_price"] == "100.00"
    assert item["minimum_increment"] == "5.00"
    assert item["reserve_price"] == "150.00"
    assert item["buy_now_price"] == "300.00"
    assert data["rules"] == {"auto_extend_seconds": 30}
    assert len(item["images"]) == 1
    assert item["images"][0]["is_primary"] is True
    assert item["images"][0]["image_url"] == "https://example.com/rolex.webp"


def test_auction_create_with_image_upload(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="Collectibles", slug="collectibles")
    client = _auction_client(user, ["auction.create", "auction.read"])

    response = client.post(
        "/api/auctions/",
        {
            **_valid_create_payload(category_id=category.id),
            "image_urls": ["https://example.com/primary.webp", "https://example.com/secondary.png"],
        },
        format="json",
    )

    assert response.status_code == 201
    images = response.data["data"]["item"]["images"]
    assert len(images) == 2
    assert images[0]["is_primary"] is True
    assert images[1]["is_primary"] is False
    assert images[0]["sort_order"] == 0
    assert images[1]["sort_order"] == 1


def test_auction_create_draft_publish_and_delete_flow(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="Drafts", slug="drafts")
    client = _auction_client(user, ["auction.create", "auction.read", "auction.update"])

    start_time = timezone.now() + timedelta(hours=3)
    end_time = start_time + timedelta(hours=2)

    create_response = client.post(
        "/api/auctions/",
        _valid_create_payload(
            category_id=category.id,
            start_time=start_time,
            end_time=end_time,
            is_draft=True,
            rules={"visibility": "seller_only"},
        ),
        format="json",
    )

    assert create_response.status_code == 201
    auction_id = create_response.data["data"]["id"]
    assert create_response.data["data"]["status"] == "DRAFT"
    assert create_response.data["data"]["rules"] == {"visibility": "seller_only"}

    delete_response = client.delete(f"/api/auctions/{auction_id}/")
    assert delete_response.status_code == 204
    assert not Auction.objects.filter(pk=auction_id).exists()

    republish_response = client.post(
        "/api/auctions/",
        _valid_create_payload(
            category_id=category.id,
            start_time=start_time,
            end_time=end_time,
            is_draft=True,
        ),
        format="json",
    )
    published_id = republish_response.data["data"]["id"]

    publish_response = client.patch(
        f"/api/auctions/{published_id}/",
        {"publish": True},
        format="json",
    )

    assert publish_response.status_code == 200
    assert publish_response.data["data"]["status"] == "SCHEDULED"


def test_auction_create_reserve_price_persists(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="Reserve", slug="reserve")
    client = _auction_client(user, ["auction.create", "auction.read"])

    response = client.post(
        "/api/auctions/",
        _valid_create_payload(category_id=category.id, reserve_price="250.00"),
        format="json",
    )

    assert response.status_code == 201
    assert response.data["data"]["item"]["reserve_price"] == "250.00"
    assert response.data["data"]["reserve_met"] is False


@pytest.mark.parametrize(
    ("override", "field", "message"),
    [
        ({"starting_price": "-1.00"}, "starting_price", "Starting price must be >= 0."),
        ({"minimum_increment": "0.00"}, "minimum_increment", "Minimum increment must be > 0."),
        ({"buy_now_price": "50.00"}, "buy_now_price", "Buy now must be >= starting price."),
        ({"reserve_price": "25.00"}, "reserve_price", "Reserve price must be >= starting price."),
        ({"condition_type": "INVALID"}, "condition_type", "is not a valid choice"),
        ({"category_id": 999999}, "category_id", "Invalid pk"),
    ],
)
def test_auction_create_rejects_invalid_fields(db, user, override, field, message):
    category, _ = AuctionCategory.objects.get_or_create(name="Validation", slug="validation")
    client = _auction_client(user, ["auction.create"])

    payload = _valid_create_payload(category_id=category.id)
    payload.update(override)
    response = client.post("/api/auctions/", payload, format="json")

    _assert_field_error(response, field, message)


def test_auction_create_rejects_end_time_before_start_time(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="Dates", slug="dates")
    client = _auction_client(user, ["auction.create"])
    start_time = timezone.now() + timedelta(hours=2)

    response = client.post(
        "/api/auctions/",
        _valid_create_payload(
            category_id=category.id,
            start_time=start_time,
            end_time=start_time,
        ),
        format="json",
    )

    _assert_field_error(response, "end_time", "End time must be after start time.")


def test_auction_create_accepts_image_urls_in_json_body(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="ImagesJson", slug="images-json")
    client = _auction_client(user, ["auction.create"])

    response = client.post(
        "/api/auctions/",
        {
            **_valid_create_payload(category_id=category.id),
            "rules": {"note": "valid json"},
            "image_urls": ["https://example.com/image.webp"],
        },
        format="json",
    )

    assert response.status_code == 201
    images = response.data["data"]["item"]["images"]
    assert len(images) == 1
    assert images[0]["image_url"] == "https://example.com/image.webp"


def test_auction_create_accepts_image_urls_field(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="ImageUrls", slug="image-urls")
    client = _auction_client(user, ["auction.create"])

    response = client.post(
        "/api/auctions/",
        {
            **_valid_create_payload(category_id=category.id),
            "image_urls": [
                "https://example.com/one.webp",
                "https://example.com/two.webp",
            ],
        },
        format="json",
    )

    assert response.status_code == 201
    assert len(response.data["data"]["item"]["images"]) == 2


def test_auction_create_rejects_invalid_image_string_in_json_body(db, user):
    category, _ = AuctionCategory.objects.get_or_create(name="BadImages", slug="bad-images")
    client = _auction_client(user, ["auction.create"])

    response = client.post(
        "/api/auctions/",
        {
            **_valid_create_payload(category_id=category.id),
            "image_urls": ["not-a-valid-url"],
        },
        format="json",
    )

    _assert_field_error(response, "image_urls", "Enter a valid URL.")


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
        format="json",
    )

    assert response.status_code == 201
    auction_id = response.data["data"]["id"]

    update_response = client.patch(
        f"/api/auctions/{auction_id}/",
        {"description": "Updated", "buy_now_price": "350.00"},
        format="json",
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
        format="json",
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
        format="json",
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


def test_draft_auction_is_hidden_from_other_users(db, user, other_user):
    category, _ = AuctionCategory.objects.get_or_create(name="Hidden", slug="hidden")
    seller_client = _auction_client(user, ["auction.create", "auction.read"])
    other_client = _auction_client(other_user, ["auction.read"])

    create_response = seller_client.post(
        "/api/auctions/",
        _valid_create_payload(category_id=category.id, is_draft=True),
        format="json",
    )
    auction_id = create_response.data["data"]["id"]

    seller_list = seller_client.get("/api/auctions/?status=DRAFT")
    other_list = other_client.get("/api/auctions/?status=DRAFT")

    seller_ids = {item["id"] for item in seller_list.data["data"]["results"]}
    other_ids = {item["id"] for item in other_list.data["data"]["results"]}

    assert auction_id in seller_ids
    assert auction_id not in other_ids


def test_auction_bids_excludes_blocked_users(db, user):
    from apps.auctions.models import Auction, AuctionItem, Bid
    from apps.social.models import Friendship, FriendshipStatus

    _grant_permissions(user, ["auction.create", "auction.read"])
    category, _ = AuctionCategory.objects.get_or_create(name="Fashion", slug="fashion")

    client = APIClient()
    client.force_authenticate(user=user)

    # Create auction
    start_time = timezone.now() + timezone.timedelta(hours=1)
    end_time = start_time + timezone.timedelta(hours=2)
    item = AuctionItem.objects.create(
        seller=user,
        title="Test Item",
        category=category,
        starting_price=100.00,
        current_price=100.00,
        minimum_increment=10.00,
    )
    auction = Auction.objects.create(
        item=item,
        start_time=start_time,
        end_time=end_time,
        status="LIVE",
    )

    # Create another user (blocked user)
    blocked_user = User.objects.create_user(
        email="blocked@example.com",
        username="blocked",
        full_name="Blocked User",
        password="password123",
    )

    # Block relationship: user blocks blocked_user
    Friendship.objects.create(
        requester=user,
        addressee=blocked_user,
        status=FriendshipStatus.BLOCKED,
    )

    # Blocked user places a bid
    bid1 = Bid.objects.create(
        auction=auction,
        bidder=blocked_user,
        amount=110.00,
    )

    # Normal user (user itself) places a bid
    bid2 = Bid.objects.create(
        auction=auction,
        bidder=user,
        amount=120.00,
    )

    # Get bids list as user -> bid1 from blocked_user should be excluded, bid2 should be present
    res = client.get(f"/api/auctions/{auction.id}/bids/")
    assert res.status_code == 200
    ids = [b["id"] for b in res.data["data"]["results"]]
    assert bid2.id in ids
    assert bid1.id not in ids

    # BidSerializer should mask bidder info of bid1 if serialized directly
    from apps.auctions.serializers.bid_serializers import BidSerializer
    class DummyRequest:
        def __init__(self, user):
            self.user = user

    serializer = BidSerializer(bid1, context={"request": DummyRequest(user)})
    data = serializer.data
    assert data["bidder"]["username"] == "Usuário Bloqueado"
    assert data["bidder"]["id"] is None

