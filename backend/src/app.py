from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config.settings import get_settings
from src.routes.health_router import router as health_router


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

    @app.get('/', tags=['root'])
    async def root() -> dict[str, str]:
        return {
            'message': 'API is running',
            'app': settings.app_name,
            'version': settings.app_version,
        }

    app.include_router(health_router)

    return app


app = create_app()
