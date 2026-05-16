import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_health_endpoint(client):
    response = client.get(reverse("health-check"))
    assert response.status_code in {200, 503}
    assert response.json()["status"] in {"ok", "degraded"}
    assert "db" in response.json()
    assert "cache" in response.json()
