from django.conf import settings
from django.db import models

from common.models import TimeStampedModel
from apps.auctions.models import Auction


class ChatRoom(TimeStampedModel):
    auction = models.ForeignKey(Auction, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "chat_rooms"
        verbose_name = "Chat Room"
        verbose_name_plural = "Chat Rooms"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name or f"Room {self.id}"


class Message(TimeStampedModel):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    message = models.TextField()
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "messages"
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["room"], name="idx_messages_room")]


class PrivateConversation(TimeStampedModel):
    user_one = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="private_conversations_one"
    )
    user_two = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="private_conversations_two"
    )

    class Meta:
        db_table = "private_conversations"
        verbose_name = "Private Conversation"
        verbose_name_plural = "Private Conversations"
        constraints = [
            models.UniqueConstraint(fields=["user_one", "user_two"], name="uniq_private_conversation"),
            models.CheckConstraint(condition=~models.Q(user_one=models.F("user_two")), name="check_private_users"),
        ]

    def save(self, *args, **kwargs):
        if self.user_one_id and self.user_two_id and self.user_one_id > self.user_two_id:
            self.user_one_id, self.user_two_id = self.user_two_id, self.user_one_id
        super().save(*args, **kwargs)


class PrivateMessage(TimeStampedModel):
    conversation = models.ForeignKey(
        PrivateConversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = "private_messages"
        verbose_name = "Private Message"
        verbose_name_plural = "Private Messages"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["conversation"], name="idx_private_messages_conv")]
