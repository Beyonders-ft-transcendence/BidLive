from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = Field(default='BidLive API', alias='APP_NAME')
    app_version: str = Field(default='0.1.0', alias='APP_VERSION')
    app_description: str = Field(
        default='Base FastAPI MVC backend built with uv.',
        alias='APP_DESCRIPTION',
    )
    debug: bool = Field(default=False, alias='DEBUG')
    database_url: str = Field(
        default='sqlite+aiosqlite:///./.data/app.db',
        alias='DATABASE_URL',
    )
    cors_origins: str = Field(default='*', alias='CORS_ORIGINS')

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_origins.strip() == '*':
            return ['*']

        return [origin.strip() for origin in self.cors_origins.split(',') if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
