from typing import Any

from django.db import transaction

from core.users.models import Role, User, UserRole


def create_user(*, email: str, username: str, full_name: str, password: str, **extra_fields: Any) -> User:
    user = User.objects.create_user(
        email=email,
        username=username,
        full_name=full_name,
        password=password,
        **extra_fields,
    )
    return user


@transaction.atomic
def assign_role(*, user: User, role_name: str) -> UserRole:
    role = Role.objects.get(name=role_name)
    user_role, _ = UserRole.objects.get_or_create(user=user, role=role)
    return user_role
