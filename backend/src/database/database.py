from __future__ import annotations

from functools import lru_cache
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from src.config.settings import get_settings


class Base(DeclarativeBase):
    pass


@lru_cache(maxsize=1)
def get_engine():
    settings = get_settings()
    connect_args: dict[str, object] = {}

    if settings.database_url.startswith('sqlite'):
        connect_args = {'check_same_thread': False}

    return create_async_engine(
        settings.database_url,
        echo=settings.debug,
        future=True,
        connect_args=connect_args,
    )


@lru_cache(maxsize=1)
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(bind=get_engine(), class_=AsyncSession, expire_on_commit=False)


async def init_session() -> AsyncGenerator[AsyncSession, None]:
    session_factory = get_session_factory()
    async with session_factory() as session:
        yield session
