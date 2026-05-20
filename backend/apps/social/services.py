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