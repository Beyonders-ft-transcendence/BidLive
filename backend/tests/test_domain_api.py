from rest_framework.test import APIClient


def test_project_list_requires_auth(db):
    client = APIClient()
    response = client.get("/api/domain/")
    assert response.status_code == 401
