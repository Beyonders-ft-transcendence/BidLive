from __future__ import annotations

from fastapi import APIRouter

from src.controllers.health_controller import HealthController
from src.schemas.health import HealthResponse

router = APIRouter(prefix='/health', tags=['health'])


@router.get('', response_model=HealthResponse, summary='Checagem de saúde')
async def health_check() -> HealthResponse:
    return await HealthController.get_status()
