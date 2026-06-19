from rest_framework import serializers

from apps.auctions.models import Auction, AuctionCategory, AuctionImage, AuctionItem
from apps.auctions.serializers.category_serializers import AuctionCategorySerializer
from apps.storage.services import is_http_url


class AuctionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionImage
        fields = ("id", "image_url", "is_primary", "sort_order", "created_at")
        read_only_fields = ("id", "created_at")


class AuctionItemSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=AuctionCategory.objects.all(), source="category", allow_null=True, required=False
    )
    category = AuctionCategorySerializer(read_only=True)
    images = AuctionImageSerializer(many=True, read_only=True)

    class Meta:
        model = AuctionItem
        fields = (
            "id",
            "seller",
            "title",
            "description",
            "category",
            "category_id",
            "category_label",
            "starting_price",
            "current_price",
            "minimum_increment",
            "reserve_price",
            "buy_now_price",
            "condition_type",
            "images",
            "created_at",
        )
        read_only_fields = ("id", "seller", "current_price", "category_label", "created_at")


class AuctionListSerializer(serializers.ModelSerializer):
    item = AuctionItemSerializer(read_only=True)

    class Meta:
        model = Auction
        fields = ("id", "item", "start_time", "end_time", "status", "winner", "is_featured", "created_at")


class AuctionDetailSerializer(serializers.ModelSerializer):
    item = AuctionItemSerializer(read_only=True)

    class Meta:
        model = Auction
        fields = (
            "id",
            "item",
            "start_time",
            "end_time",
            "status",
            "winner",
            "winning_bid",
            "started_at",
            "ended_at",
            "cancelled_at",
            "cancelled_by",
            "cancel_reason",
            "buy_now_at",
            "buy_now_by",
            "reserve_met",
            "is_featured",
            "rules",
            "created_at",
        )


class AuctionCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=AuctionCategory.objects.all(), source="category", allow_null=True, required=False
    )
    condition_type = serializers.ChoiceField(choices=AuctionItem._meta.get_field("condition_type").choices)
    starting_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    minimum_increment = serializers.DecimalField(max_digits=12, decimal_places=2)
    reserve_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    buy_now_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    is_draft = serializers.BooleanField(required=False, default=False)
    rules = serializers.JSONField(required=False)
    image_urls = serializers.ListField(child=serializers.URLField(), required=False)

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": ["End time must be after start time."]})
        if attrs.get("starting_price") is not None and attrs["starting_price"] < 0:
            raise serializers.ValidationError({"starting_price": ["Starting price must be >= 0."]})
        if attrs.get("minimum_increment") is not None and attrs["minimum_increment"] <= 0:
            raise serializers.ValidationError({"minimum_increment": ["Minimum increment must be > 0."]})
        buy_now_price = attrs.get("buy_now_price")
        if buy_now_price is not None and buy_now_price < attrs.get("starting_price"):
            raise serializers.ValidationError({"buy_now_price": ["Buy now must be >= starting price."]})
        reserve_price = attrs.get("reserve_price")
        if reserve_price is not None and reserve_price < attrs.get("starting_price"):
            raise serializers.ValidationError({"reserve_price": ["Reserve price must be >= starting price."]})
        return attrs


class AuctionUpdateSerializer(serializers.Serializer):
    description = serializers.CharField(allow_blank=True, required=False)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=AuctionCategory.objects.all(), source="category", allow_null=True, required=False
    )
    start_time = serializers.DateTimeField(required=False)
    end_time = serializers.DateTimeField(required=False)
    buy_now_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    reserve_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    rules = serializers.JSONField(required=False)
    image_urls = serializers.ListField(child=serializers.URLField(), required=False)
    primary_image_id = serializers.IntegerField(required=False)
    publish = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": ["End time must be after start time."]})
        if "buy_now_price" in attrs and attrs["buy_now_price"] is not None and attrs["buy_now_price"] < 0:
            raise serializers.ValidationError({"buy_now_price": ["Buy now must be >= 0."]})
        if "reserve_price" in attrs and attrs["reserve_price"] is not None and attrs["reserve_price"] < 0:
            raise serializers.ValidationError({"reserve_price": ["Reserve price must be >= 0."]})
        return attrs


class AuctionCancelSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)


class AuctionBuyNowSerializer(serializers.Serializer):
    pass
