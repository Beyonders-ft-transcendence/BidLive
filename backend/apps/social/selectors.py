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


def list_friends(*, user: User) -> QuerySet[User]:
	addressee_ids = Friendship.objects.filter(
		requester=user, status=FriendshipStatus.ACCEPTED
	).values_list("addressee_id", flat=True)

	requester_ids = Friendship.objects.filter(
		addressee=user, status=FriendshipStatus.ACCEPTED
	).values_list("requester_id", flat=True)

	friends_id = list(addressee_ids) + list(requester_ids)

	return User.objects.filter(
		id__in=friends_id,
		is_active=True,
		is_deleted=False,
	)


def list_online_friends(*, user: User) -> QuerySet[User]:
	return list_friends(user=user).filter(is_online=True)


def list_pending_requests_received(*, user: User) -> QuerySet[Friendship]:
	return Friendship.objects.filter(
		requester=user,
		status=FriendshipStatus.PENDING,
	).select_related("addressee")


def list_pending_requests_sent(*, user: User) -> QuerySet[Friendship]:
	return Friendship.objects.filter(
		requester=user,
		status=FriendshipStatus.PENDING,
	).select_related("addressee")