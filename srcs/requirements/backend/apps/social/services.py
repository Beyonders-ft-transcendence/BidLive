from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.social.models import Friendship, FriendshipStatus
from apps.social.selectors import get_friendship, get_friendship_by_id
from apps.users.models import User


@transaction.atomic
def send_friend_request(*, requester: User, addressee: User) -> Friendship:
	if requester.id == addressee.id:
		raise ValidationError({"detail": "Não podes adicionar-te a ti mesmo."})
	
	existing = get_friendship(user=requester, other_user=addressee)

	if existing:
		if existing.status == FriendshipStatus.ACCEPTED:
			raise ValidationError({"detail": "Já são amigos."})
		if existing.status == FriendshipStatus.PENDING:
			raise ValidationError({"detail": "Já existe um pedido pendente."})
		if existing.status == FriendshipStatus.BLOCKED:
			raise ValidationError({"detail": "Não é possível enviar pedido."})
		
	return Friendship.objects.create(
		requester=requester,
		addressee=addressee,
		status=FriendshipStatus.PENDING,
	)


@transaction.atomic
def accept_friend_request(*, friendship_id: int, user: User) -> Friendship:
	try:
		friendship = get_friendship_by_id(friendship_id=friendship_id, user=user)
	except Friendship.DoesNotExist:
		raise ValidationError({"detail": "Pedido não encontrado."})
	
	if friendship.addressee_id != user.id:
		raise PermissionDenied({"detail": "Só o destinatário pode aceitar o pedido."})
	
	if friendship.status != FriendshipStatus.PENDING:
		raise ValidationError({"detail": "Este pedido não está pendente."})
	
	friendship.status = FriendshipStatus.ACCEPTED
	friendship.save(update_fields=["status", "updated_at"])
	return friendship


@transaction.atomic
def reject_friend_request(*, friendship_id: int, user: User) -> None:
	try:
		friendship = get_friendship_by_id(friendship_id=friendship_id, user=user)
	except Friendship.DoesNotExist:
		raise ValidationError({"detail": "Pedido não encontrado."})
	
	if friendship.addressee_id != user.id:
		raise PermissionDenied({"detail": "Só o destinatário pode rejeitar o pedido."})
	
	if friendship.status != FriendshipStatus.PENDING:
		raise ValidationError({"detail": "Este pedido não está pendente."})
	
	friendship.delete()


@transaction.atomic
def remove_friend(*, friend_id: int, user: User) -> None:
	from django.db.models import Q
	friendship = Friendship.objects.filter(
		Q(requester=user, addressee_id=friend_id) | 
		Q(requester_id=friend_id, addressee=user),
		status=FriendshipStatus.ACCEPTED
	).first()
	
	if not friendship:
		raise ValidationError({"detail": "Não há amizade ativa para remover."})
	
	friendship.delete()


@transaction.atomic
def block_user(*, blocker: User, blocked: User) -> Friendship:
    if blocker.id == blocked.id:
        raise ValidationError({"detail": "Não podes bloquear-te a ti mesmo."})

    existing = Friendship.objects.filter(
        requester=blocker,
        addressee=blocked
    ).first() or Friendship.objects.filter(
        requester=blocked,
        addressee=blocker
    ).first()

    if existing:
        if existing.status == FriendshipStatus.BLOCKED:
            raise ValidationError({"detail": "Utilizador já está bloqueado."})

        existing.requester = blocker
        existing.addressee = blocked
        existing.status = FriendshipStatus.BLOCKED
        existing.save(update_fields=["requester", "addressee", "status", "updated_at"])
        return existing

    return Friendship.objects.create(
        requester=blocker,
        addressee=blocked,
        status=FriendshipStatus.BLOCKED,
    )


@transaction.atomic
def unblock_user(*, blocker: User, blocked: User) -> None:
	try:
		friendship = Friendship.objects.get(
			requester=blocker,
			addressee=blocked,
			status=FriendshipStatus.BLOCKED,
		)
	except Friendship.DoesNotExist:
		raise ValidationError({"detail": "Não existe bloqueio para remover."})
	
	friendship.delete()
