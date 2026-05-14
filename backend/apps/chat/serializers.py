from rest_framework import serializers

from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ("id", "auction", "name", "created_at")


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "room", "sender", "message", "is_deleted", "created_at")


class PrivateConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateConversation
        fields = ("id", "user_one", "user_two", "created_at")


class PrivateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateMessage
        fields = ("id", "conversation", "sender", "message", "is_read", "created_at")
