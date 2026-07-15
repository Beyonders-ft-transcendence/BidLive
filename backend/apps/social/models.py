from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class FriendshipStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    ACCEPTED = "ACCEPTED", "Accepted"
    BLOCKED = "BLOCKED", "Blocked"


class Friendship(TimeStampedModel):
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendship_requests"
    )
    addressee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendship_received"
    )
    status = models.CharField(max_length=20, choices=FriendshipStatus.choices, default=FriendshipStatus.PENDING)

    class Meta:
        db_table = "friendships"
        verbose_name = "Friendship"
        verbose_name_plural = "Friendships"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["requester", "addressee"], name="idx_friendships_pair")
        ]
        constraints = [
            models.UniqueConstraint(fields=["requester", "addressee"], name="uniq_friendship_pair"),
            models.CheckConstraint(condition=~models.Q(requester=models.F("addressee")), name="check_friendship_users"),
        ]
