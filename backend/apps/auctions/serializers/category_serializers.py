from rest_framework import serializers

from apps.auctions.models import AuctionCategory


class AuctionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionCategory
        fields = ("id", "name", "slug", "description", "parent", "is_active", "sort_order")


class AuctionCategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionCategory
        fields = ("name", "slug", "description", "parent", "is_active", "sort_order")
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "parent": {"required": False, "allow_null": True},
            "is_active": {"required": False},
            "sort_order": {"required": False},
        }


class AuctionCategoryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionCategory
        fields = ("name", "slug", "description", "parent", "is_active", "sort_order")
        extra_kwargs = {
            "name": {"required": False},
            "slug": {"required": False},
            "description": {"required": False, "allow_blank": True},
            "parent": {"required": False, "allow_null": True},
            "is_active": {"required": False},
            "sort_order": {"required": False},
        }
