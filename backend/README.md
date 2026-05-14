# BidLive Backend

Production-ready Django REST foundation with modular architecture, Celery, Redis, and PostgreSQL.

## Stack

- Python 3.12+
- Django + Django REST Framework
- PostgreSQL, Redis, Celery
- JWT auth, OpenAPI, CORS
- Docker + uv

## Project Layout

- config: settings, ASGI/WSGI, URLs, Celery
- core: shared domain modules (users, auth)
- apps: business domains (projects)
- api: HTTP layer and versioned routes
- common: shared utilities, responses, permissions
- infrastructure: external integrations
- tools: ops utilities (entrypoint, gunicorn config)
- scripts: local automation
- tests: pytest suites

## Quickstart (local)

1) Create env file

```bash
cp .env.example .env
```

2) Create environment and install deps

```bash
uv venv
uv sync
```

3) Run migrations and start server

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

Open http://localhost:8000/api/v1/health/

## Docker (dev)

```bash
docker compose up --build
```

## Main commands (uv)

```bash
uv sync
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py runserver 0.0.0.0:8000
uv run pytest -q
uv run celery -A config worker -l info
uv run celery -A config beat -l info
```

## API docs

- OpenAPI schema: /api/schema/
- Swagger UI: /api/docs/

## Creating apps

```bash
uv run python manage.py startapp billing apps/billing
```

Add the app to INSTALLED_APPS and create URLs, serializers, and services.

## Production notes

- Set DJANGO_ENV=production and DJANGO_SETTINGS_MODULE=config.settings.production
- Ensure SECRET_KEY and ALLOWED_HOSTS are set via environment
- Use a reverse proxy for TLS termination
- Run with gunicorn and uvicorn workers

Example production command:

```bash
gunicorn config.wsgi:application -c tools/gunicorn.conf.py
```
