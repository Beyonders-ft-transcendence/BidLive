from __future__ import annotations

from src.config.settings import get_settings
from src.schemas.health import HealthResponse


class HealthService:
    @staticmethod
    def build_status() -> HealthResponse:
        settings = get_settings()
        return HealthResponse(
            status='ok',
            service=settings.app_name,
            version=settings.app_version,
        )
