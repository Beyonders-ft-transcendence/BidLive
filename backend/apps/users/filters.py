import django_filters

from apps.users.models import User, UserStatus


class UserFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=UserStatus.choices)
    is_verified = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    role = django_filters.CharFilter(field_name="roles__name", lookup_expr="iexact")
    created_after = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = django_filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = User
        fields = ["status", "is_verified", "is_active", "role"]
