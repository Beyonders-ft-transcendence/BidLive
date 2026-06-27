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


def list_private_messages(
    *, conversation_id: int, user: User
) -> QuerySet[PrivateMessage]:
    return (
        PrivateMessage.objects.filter(
            conversation_id=conversation_id,
            conversation__user_one=user,
        )
        | PrivateMessage.objects.filter(
            conversation_id=conversation_id,
            conversation__user_two=user,
        )
    ).select_related("sender").order_by("created_at")


def get_or_create_auction_room(*, auction_id: int) -> tuple[ChatRoom, bool]:
    return ChatRoom.objects.get_or_create(
        auction_id=auction_id,
        defaults={"name": f"Auction {auction_id} Chat"},
    )


def get_room_messages(
    *, room_id: int, viewer: User | None = None
) -> QuerySet[Message]:
    """
    Mensagens visíveis de uma sala.
    BE-005: se viewer for fornecido, exclui mensagens de utilizadores
    que o viewer bloqueou (ou que bloquearam o viewer).
    """
    from apps.social.models import Friendship, FriendshipStatus

    qs = Message.objects.filter(room_id=room_id, is_deleted=False)

    if viewer:
        blocked_ids = Friendship.objects.filter(
            Q(requester=viewer) | Q(addressee=viewer),
            status=FriendshipStatus.BLOCKED,
        ).values_list(
            "addressee_id", flat=True
        ) | Friendship.objects.filter(
            Q(requester=viewer) | Q(addressee=viewer),
            status=FriendshipStatus.BLOCKED,
        ).values_list("requester_id", flat=True)

        blocked_ids = [bid for bid in blocked_ids if bid != viewer.id]
        qs = qs.exclude(sender_id__in=blocked_ids)

    return qs.select_related("sender").order_by("created_at")


def get_room(*, room_id: int) -> ChatRoom | None:
    return ChatRoom.objects.filter(id=room_id).select_related("auction").first()
