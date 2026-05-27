from rest_framework import serializers

from apps.auctions.models import Bid


class BidderSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)


class BidSerializer(serializers.ModelSerializer):
    bidder = BidderSummarySerializer(read_only=True)
    bidder_id = serializers.IntegerField(read_only=True)
    auction_id = serializers.IntegerField(read_only=True)
    timestamp = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Bid
        fields = (
            "id",
            "auction",
            "auction_id",
            "bidder",
            "bidder_id",
            "amount",
            "is_buy_now",
            "ip_address",
            "metadata",
            "timestamp",
            "created_at",
        )
        read_only_fields = fields


class BidCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    metadata = serializers.JSONField(required=False)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bid must be > 0.")
        return value
