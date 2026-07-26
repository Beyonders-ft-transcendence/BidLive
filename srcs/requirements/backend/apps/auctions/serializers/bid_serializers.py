from rest_framework import serializers

from apps.auctions.models import Bid
from common.fields import LocalDateTimeField, LocalDateTimeOutputField, LocalizedModelSerializer


class BidderSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)


class BidSerializer(LocalizedModelSerializer):
    bidder = BidderSummarySerializer(read_only=True)
    bidder_id = serializers.IntegerField(read_only=True)
    auction_id = serializers.IntegerField(read_only=True)
    timestamp = LocalDateTimeField(source="created_at", read_only=True)
    created_at = LocalDateTimeOutputField(read_only=True)

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            from apps.social.selectors import get_blocked_user_ids
            blocked_ids = get_blocked_user_ids(user=request.user)
            if instance.bidder_id in blocked_ids:
                ret["bidder"] = {
                    "id": None,
                    "username": "Usuário Bloqueado",
                    "full_name": "Usuário Bloqueado"
                }
                ret["bidder_id"] = None
        return ret


class BidCreateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    metadata = serializers.JSONField(required=False)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bid must be > 0.")
        return value

class ActivitySerializer(LocalizedModelSerializer):
    bidder = BidderSummarySerializer(read_only=True)
    auction_title = serializers.CharField(source="auction.item.title", read_only=True)
    created_at = LocalDateTimeOutputField(read_only=True)

    class Meta:
        model = Bid
        fields = (
            "id",
            "auction_id",
            "auction_title",
            "bidder",
            "amount",
            "is_buy_now",
            "created_at",
        )
        read_only_fields = fields

