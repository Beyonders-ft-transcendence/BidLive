from django.db.models import QuerySet

from core.users.models import User, UserStatus


def get_user_by_email(*, email: str) -> User:
    return User.objects.get(email=email)


def active_users() -> QuerySet[User]:
    return User.objects.filter(is_active=True, status=UserStatus.ACTIVE)
