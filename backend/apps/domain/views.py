from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.domain.filters import ProjectFilter
from apps.domain.models import Project
from apps.domain.permissions import IsOwnerOrAdmin
from apps.domain.serializers import ProjectSerializer
from apps.domain.services import create_project, update_project


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filterset_class = ProjectFilter
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
        project = create_project(owner=self.request.user, data=serializer.validated_data)
        serializer.instance = project

    def perform_update(self, serializer):
        project = update_project(project=serializer.instance, data=serializer.validated_data)
        serializer.instance = project
