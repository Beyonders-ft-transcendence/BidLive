from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from src.app import app


@pytest.mark.anyio
async def test_root_route() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url='http://testserver',
    ) as client:
        response = await client.get('/')

    assert response.status_code == 200
    assert response.json()['message'] == 'API is running'


@pytest.mark.anyio
async def test_health_route() -> None:
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url='http://testserver',
    ) as client:
        response = await client.get('/health')

    assert response.status_code == 200
    assert response.json()['status'] == 'ok'