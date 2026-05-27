from django.db.models import Q, QuerySet

from apps.chat.models import (
    ChatRoom,
    Message,
    PrivateConversation,
    PrivateMessage,
)
from apps.users.models import User


def get_or_create_private_conversation(
        *, user_one: User, user_two: User
) -> tuple[PrivateConversation, bool]:
    uid1, uid2 = sorted([user_one.id, user_two.id])
    conversation, created = PrivateConversation.objects.get_or_create(
        user_one_id=uid1,
        user_two_id=uid2,
    )
    return conversation, created


def get_private_conversation(
    *, conversation_id: int, user: User
) -> PrivateConversation | None:
    return PrivateConversation.objects.filter(
        Q(user_one=user) | Q(user_two=user),
        id=conversation_id,
    ).first()


def list_private_conversations(*, user: User) -> QuerySet[PrivateConversation]:
    return (
        PrivateConversation.objects.filter(
            Q(user_one=user) | Q(user_two=user)
        )
        .select_related("user_one", "user_two")
        .order_by("-updated_at")
    )
