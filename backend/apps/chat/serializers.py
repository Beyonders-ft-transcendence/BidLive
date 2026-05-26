from rest_framework import serializers

from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage
from apps.users.models import User


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "full_name", "avatar_url", "is_online")
        read_only_fields = fields


