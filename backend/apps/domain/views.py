from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.domain.filters import DomainFilter
from apps.domain.models import Domain
from apps.domain.permissions import IsOwnerOrAdmin
from apps.domain.serializers import DomainSerializer
from apps.domain.services import create_domain, update_domain


class DomainViewSet(viewsets.ModelViewSet):
    serializer_class = DomainSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = DomainFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "budget", "status"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Project.objects.none()
        user = getattr(self.request, "user", None)
        if not user or getattr(user, "is_anonymous", True):
            return Project.objects.none()
        return Project.objects.filter(owner=user).order_by("-created_at")

    def perform_create(self, serializer):
        project = create_domain(owner=self.request.user, data=serializer.validated_data)
        serializer.instance = project

    def perform_update(self, serializer):
        project = update_domain(project=serializer.instance, data=serializer.validated_data)
        serializer.instance = project
