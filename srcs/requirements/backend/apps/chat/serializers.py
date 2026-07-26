from rest_framework import serializers

from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage
from apps.social.selectors import are_friends
from apps.users.models import User
from common.fields import LocalizedModelSerializer


class ChatUserSerializer(LocalizedModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "full_name",
            "avatar_url",
            "bio",
            "is_online"
        )
        read_only_fields = fields


class PrivateMessageSerializer(LocalizedModelSerializer):
    sender = ChatUserSerializer(read_only=True)

    class Meta:
        model = PrivateMessage
        fields = (
            "id",
            "conversation",
            "sender",
            "message",
            "is_read",
            "created_at"
        )
        read_only_fields = fields


class PrivateConversationSerializer(LocalizedModelSerializer):
    user_one = ChatUserSerializer(read_only=True)
    user_two = ChatUserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    are_friends = serializers.SerializerMethodField()
    recommend_friendship = serializers.SerializerMethodField()

    class Meta:
        model = PrivateConversation
        fields = (
            "id",
            "user_one",
            "user_two",
            "last_message",
            "unread_count",
            "are_friends",
            "recommend_friendship",
            "created_at"
        )
        read_only_fields = fields

    def get_are_friends(self, obj) -> bool:
        return are_friends(user=obj.user_one, other_user=obj.user_two)

    def get_recommend_friendship(self, obj) -> bool:
        from apps.chat.services import _has_trade_relationship
        friends = are_friends(user=obj.user_one, other_user=obj.user_two)
        trade = _has_trade_relationship(obj.user_one, obj.user_two)
        return trade and not friends

    def get_last_message(self, obj) -> dict | None:
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return None
        return {
            "id": last.id,
            "message": last.message[:80],
            "sender_id": last.sender_id,
            "created_at": last.created_at,
        }

    def get_unread_count(self, obj) -> int:
        request = self.context.get("request")
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class SendPrivateMessageSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    message = serializers.CharField(max_length=2000, trim_whitespace=True)

    def validate_recipient_id(self, value: int) -> User:
        try:
            return User.objects.get(id=value, is_active=True, is_deleted=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("Utilizador não encontrado.")


class RoomMessageSerializer(LocalizedModelSerializer):
    sender = ChatUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "room",
            "sender",
            "message",
            "is_deleted",
            "created_at"
        )
        read_only_fields = fields


class ChatRoomSerializer(LocalizedModelSerializer):
    auction = serializers.IntegerField(source="auction_id", read_only=True)

    class Meta:
        model = ChatRoom
        fields = ("id", "auction", "name", "created_at")
        read_only_fields = fields


class SendRoomMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000, trim_whitespace=True)
