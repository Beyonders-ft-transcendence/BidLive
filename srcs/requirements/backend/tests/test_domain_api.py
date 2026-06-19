from rest_framework.test import APIClient

from apps.domain.models import Domain
from apps.users.models import User


def test_domain_list_requires_auth(db):
    client = APIClient()
    response = client.get("/api/domain/")
    assert response.status_code == 401


def test_domain_list_returns_only_authenticated_users_domains(db, auth_client, user):
    other_user = User.objects.create_user(
        email="other@example.com",
        username="other_user",
        full_name="Other User",
        password="pass",
    )
    own_domain = Domain.objects.create(
        owner=user,
        name="Own domain",
        description="Visible domain",
        status="active",
        budget="150.00",
    )
    Domain.objects.create(
        owner=other_user,
        name="Other domain",
        description="Hidden domain",
        status="active",
        budget="250.00",
    )

    response = auth_client.get("/api/domain/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["id"] == own_domain.id


def test_domain_list_supports_filters_search_and_ordering(db, auth_client, user):
    Domain.objects.create(
        owner=user,
        name="Alpha Launch",
        description="Public sale",
        status="active",
        budget="300.00",
    )
    Domain.objects.create(
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


def test_domain_create_route_creates_owned_domain(db, auth_client, user, monkeypatch):
    monkeypatch.setattr("apps.domain.tasks.notify_domain_created.delay", lambda domain_id: None)

    response = auth_client.post(
        "/api/domain/",
        {
            "name": "New domain",
            "description": "Created through the API",
            "status": "draft",
            "budget": "999.99",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["owner"] == user.id
    assert Domain.objects.filter(owner=user, name="New domain").exists()


def test_domain_retrieve_route_returns_owned_domain(db, auth_client, user):
    domain = Domain.objects.create(owner=user, name="domain Detail")

    response = auth_client.get(f"/api/domain/{domain.id}/")

    assert response.status_code == 200
    assert response.data["id"] == domain.id
    assert response.data["name"] == "domain Detail"


def test_domain_retrieve_route_hides_other_users_domain(db, auth_client):
    other_user = User.objects.create_user(
        email="hidden@example.com",
        username="hidden_user",
        full_name="Hidden User",
        password="pass",
    )
    domain = Domain.objects.create(owner=other_user, name="Hidden domain")

    response = auth_client.get(f"/api/domain/{domain.id}/")

    assert response.status_code == 404


def test_domain_update_route_updates_owned_domain(db, auth_client, user):
    domain = Domain.objects.create(owner=user, name="Old Name", description="Old")

    response = auth_client.put(
        f"/api/domain/{domain.id}/",
        {
            "name": "Updated Name",
            "description": "Updated description",
            "status": "active",
            "budget": "10.00",
            "is_archived": False,
        },
        format="json",
    )

    domain.refresh_from_db()
    assert response.status_code == 200
    assert domain.name == "Updated Name"
    assert domain.status == "active"


def test_domain_partial_update_route_updates_owned_domain(db, auth_client, user):
    domain = Domain.objects.create(owner=user, name="Partial domain", budget="10.00")

    response = auth_client.patch(
        f"/api/domain/{domain.id}/",
        {"budget": "25.50"},
        format="json",
    )

    domain.refresh_from_db()
    assert response.status_code == 200
    assert str(domain.budget) == "25.50"


def test_domain_delete_route_deletes_owned_domain(db, auth_client, user):
    domain = Domain.objects.create(owner=user, name="Delete domain")

    response = auth_client.delete(f"/api/domain/{domain.id}/")

    assert response.status_code == 204
    assert not Domain.objects.filter(id=domain.id).exists()
