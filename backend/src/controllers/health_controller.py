from __future__ import annotations

from src.schemas.health import HealthResponse
from src.services.health_service import HealthService


class HealthController:
    @staticmethod
    async def get_status() -> HealthResponse:
        return HealthService.build_status()
