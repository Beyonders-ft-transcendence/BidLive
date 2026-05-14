from rest_framework import serializers

from apps.auctions.models import Auction, AuctionItem, Bid, LiveStream


class AuctionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionItem
        fields = (
            "id",
            "seller",
            "title",
            "description",
            "category",
            "starting_price",
            "current_price",
            "buy_now_price",
            "image_url",
            "condition_type",
            "created_at",
        )


class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = (
            "id",
            "item",
            "start_time",
            "end_time",
            "status",
            "winner",
            "created_at",
        )


class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ("id", "auction", "bidder", "amount", "created_at")


class LiveStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveStream
        fields = ("id", "auction", "streamer", "stream_key", "is_live", "created_at")
