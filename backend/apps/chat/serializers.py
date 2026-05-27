from rest_framework import serializers

from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage
from apps.users.models import User


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", 
            "username", 
            "full_name", 
            "avatar_url", 
            "is_online"
        )
        read_only_fields = fields


class PrivateMessageSerializer(serializers.ModelSerializer):
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

