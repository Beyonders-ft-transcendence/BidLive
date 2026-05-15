import django_filters

from apps.domain.models import Project


class ProjectFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status")
    min_budget = django_filters.NumberFilter(field_name="budget", lookup_expr="gte")
    max_budget = django_filters.NumberFilter(field_name="budget", lookup_expr="lte")

    class Meta:
        model = Project
        fields = ["status", "is_archived"]
