from rest_framework import serializers

from apps.auctions.models import Bid


class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = ("id", "auction", "bidder", "amount", "is_buy_now", "created_at")


class BidCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bid must be > 0.")
        return value
