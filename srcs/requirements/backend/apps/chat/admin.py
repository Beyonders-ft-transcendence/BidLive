from django.contrib import admin

from apps.chat.models import ChatRoom, Message, PrivateConversation, PrivateMessage


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "auction", "created_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("room", "sender", "created_at", "is_deleted")
    list_filter = ("is_deleted",)


@admin.register(PrivateConversation)
class PrivateConversationAdmin(admin.ModelAdmin):
    list_display = ("user_one", "user_two", "created_at")


@admin.register(PrivateMessage)
class PrivateMessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "created_at", "is_read")
