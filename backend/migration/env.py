from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from src.database import models  # noqa: F401,E402
from src.database.database import Base  # noqa: E402

target_metadata = Base.metadata


def _alembic_database_url() -> str:
    url = (
        os.getenv('ALEMBIC_DATABASE_URL')
        or os.getenv('DATABASE_URL')
        or config.get_main_option('sqlalchemy.url')
        or 'sqlite:///./.data/app.db'
    )

    if url.startswith('sqlite+aiosqlite'):
        return url.replace('sqlite+aiosqlite', 'sqlite', 1)

    if url.startswith('postgresql+asyncpg'):
        return url.replace('postgresql+asyncpg', 'postgresql+psycopg', 1)

    return url


def run_migrations_offline() -> None:
    context.configure(
        url=_alembic_database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration['sqlalchemy.url'] = _alembic_database_url()

    connectable = engine_from_config(
        configuration,
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
