from django.db.models import Q, QuerySet

from apps.social.models import Friendship, FriendshipStatus
from apps.users.models import User


def get_friendship(*, user: User, other_user: User) -> Friendship | None:
	return Friendship.objects.filter(
		Q(requester=user, addressee=other_user)
		| Q(requester=other_user, addressee=user)
	).first()


def get_friendship_by_id(*, friendship_id: int, user: User) -> Friendship:
	return Friendship.objects.get(
		Q(requester=user) | Q(addressee=user),
		id=friendship_id,
	)


