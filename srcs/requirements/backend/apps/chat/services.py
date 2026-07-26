from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.chat.models import Message, PrivateMessage
from apps.chat.selectors import (
    get_or_create_auction_room,
    get_or_create_private_conversation,
    get_private_conversation,
)
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user
from apps.social.selectors import are_friends, is_blocked
from apps.users.models import User
from apps.auctions.models import Auction


def _has_trade_relationship(user1: User, user2: User) -> bool:
    return Auction.objects.filter(
        (Q(item__seller=user1) & Q(winner=user2)) |
        (Q(item__seller=user2) & Q(winner=user1))
    ).exists()


@transaction.atomic
def send_private_message(
    *, sender: User, recipient: User, text: str
) -> PrivateMessage:
    if not text or not text.strip():
        raise ValidationError("A mensagem não pode estar vazia.")

    if sender.id == recipient.id:
        raise ValidationError("Não podes enviar mensagem a ti mesmo.")

    if is_blocked(user=sender, other_user=recipient):
        raise ValidationError("Não podes enviar mensagem a este utilizador.")

    if not are_friends(user=sender, other_user=recipient) and not _has_trade_relationship(sender, recipient):
        raise ValidationError("Só podes enviar mensagens privadas a amigos ou parceiros de leilões encerrados.")

    conversation, _ = get_or_create_private_conversation(
        user_one=sender,
        user_two=recipient,
    )

    message = PrivateMessage.objects.create(
        conversation=conversation,
        sender=sender,
        message=text.strip(),
        is_read=False,
    )

    notify_user(
        user=recipient,
        notification_type=NotificationType.MESSAGE,
        title=f"Nova mensagem de {sender.full_name}",
        content=text[:100],
    )

    return message


@transaction.atomic
def mark_messages_as_read(*, conversation_id: int, user: User) -> int:
    conversation = get_private_conversation(conversation_id=conversation_id, user=user)
    if not conversation:
        raise ValidationError("Conversa não encontrada.")

    updated = PrivateMessage.objects.filter(
        conversation_id=conversation_id,
        is_read=False,
    ).exclude(sender=user).update(is_read=True)

    return updated


@transaction.atomic
def delete_private_message(*, message_id: int, user: User) -> None:
    try:
        message = PrivateMessage.objects.get(id=message_id, sender=user)
    except PrivateMessage.DoesNotExist:
        raise PermissionDenied("Não tens permissão para apagar esta mensagem.")

    message.delete()


@transaction.atomic
def send_room_message(*, sender: User, auction_id: int, text: str) -> Message:
    if not text or not text.strip():
        raise ValidationError("A mensagem não pode estar vazia.")

    if len(text.strip()) > 2000:
        raise ValidationError("A mensagem excede o limite de 2000 caracteres.")

    room, _ = get_or_create_auction_room(auction_id=auction_id)

    return Message.objects.create(
        room=room,
        sender=sender,
        message=text.strip(),
    )


@transaction.atomic
def soft_delete_room_message(*, message_id: int, user: User) -> Message:
    try:
        message = Message.objects.get(id=message_id)
    except Message.DoesNotExist:
        raise ValidationError("Mensagem não encontrada.")

    if message.sender_id != user.id:
        raise PermissionDenied("Só o autor pode apagar esta mensagem.")

    message.is_deleted = True
    message.save(update_fields=["is_deleted", "updated_at"])
    return message
