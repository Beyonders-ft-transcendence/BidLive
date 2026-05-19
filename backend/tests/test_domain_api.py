from rest_framework.test import APIClient

from apps.domain.models import Domain
from apps.users.models import User


def test_project_list_requires_auth(db):
    client = APIClient()
    response = client.get("/api/domain/")
    assert response.status_code == 401


def test_project_list_returns_only_authenticated_users_projects(db, auth_client, user):
    other_user = User.objects.create_user(
        email="other@example.com",
        username="other_user",
        full_name="Other User",
        password="pass",
    )
    own_project = Project.objects.create(
        owner=user,
        name="Own Project",
        description="Visible project",
        status="active",
        budget="150.00",
    )
    Project.objects.create(
        owner=other_user,
        name="Other Project",
        description="Hidden project",
        status="active",
        budget="250.00",
    )

    response = auth_client.get("/api/domain/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == own_project.id


def test_project_list_supports_filters_search_and_ordering(db, auth_client, user):
    Project.objects.create(
        owner=user,
        name="Alpha Launch",
        description="Public sale",
        status="active",
        budget="300.00",
    )
    Project.objects.create(
        owner=user,
        name="Beta Draft",
        description="Private sale",
        status="draft",
        budget="50.00",
    )

    response = auth_client.get(
        "/api/domain/",
        {"status": "active", "min_budget": "100", "search": "alpha", "ordering": "budget"},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["name"] == "Alpha Launch"


def test_project_create_route_creates_owned_project(db, auth_client, user, monkeypatch):
    monkeypatch.setattr("apps.domain.tasks.notify_domain_created.delay", lambda project_id: None)

    response = auth_client.post(
        "/api/domain/",
        {
            "name": "New Project",
            "description": "Created through the API",
            "status": "draft",
            "budget": "999.99",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["owner"] == user.id
    assert Project.objects.filter(owner=user, name="New Project").exists()


def test_project_retrieve_route_returns_owned_project(db, auth_client, user):
    project = Project.objects.create(owner=user, name="Project Detail")

    response = auth_client.get(f"/api/domain/{project.id}/")

    assert response.status_code == 200
    assert response.data["id"] == project.id
    assert response.data["name"] == "Project Detail"


def test_project_retrieve_route_hides_other_users_project(db, auth_client):
    other_user = User.objects.create_user(
        email="hidden@example.com",
        username="hidden_user",
        full_name="Hidden User",
        password="pass",
    )
    project = Project.objects.create(owner=other_user, name="Hidden Project")

    response = auth_client.get(f"/api/domain/{project.id}/")

    assert response.status_code == 404


def test_project_update_route_updates_owned_project(db, auth_client, user):
    project = Project.objects.create(owner=user, name="Old Name", description="Old")

    response = auth_client.put(
        f"/api/domain/{project.id}/",
        {
            "name": "Updated Name",
            "description": "Updated description",
            "status": "active",
            "budget": "10.00",
            "is_archived": False,
        },
        format="json",
    )

    project.refresh_from_db()
    assert response.status_code == 200
    assert project.name == "Updated Name"
    assert project.status == "active"


def test_project_partial_update_route_updates_owned_project(db, auth_client, user):
    project = Project.objects.create(owner=user, name="Partial Project", budget="10.00")

    response = auth_client.patch(
        f"/api/domain/{project.id}/",
        {"budget": "25.50"},
        format="json",
    )

    project.refresh_from_db()
    assert response.status_code == 200
    assert str(project.budget) == "25.50"


def test_project_delete_route_deletes_owned_project(db, auth_client, user):
    project = Project.objects.create(owner=user, name="Delete Project")

    response = auth_client.delete(f"/api/domain/{project.id}/")

    assert response.status_code == 204
    assert not Project.objects.filter(id=project.id).exists()
