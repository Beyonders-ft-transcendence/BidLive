# BidLive Backend

Base Django REST pronta para produção com arquitetura modular, Celery, Redis e PostgreSQL.

## Stack

- Python 3.12+
- Django + Django REST Framework
- PostgreSQL, Redis, Celery
- JWT auth, OpenAPI, CORS
- Docker + uv

## Project Layout

- config: configurações, ASGI/WSGI, URLs, Celery
- core: módulos de domínio compartilhados (usuários, autenticação)
- apps: domínios de negócios (projetos)
- api: camada HTTP e rotas versionadas
- common: utilitários compartilhados, respostas, permissões
- infrastructure: integrações externas
- tools: utilitários de operações (entrypoint, configuração do gunicorn)
- scripts: automação local
- tests: suítes de testes pytest

## Quickstart (local)

1) Criar arquivo env

```bash
cp .env.example .env
```

2) Crie o ambiente virtual e instale as dependências.

```bash
uv venv
uv sync
```

3) Execute as migrações e inicie o servidor.

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

Adicione o aplicativo à lista INSTALLED_APPS e crie URLs, serializadores e serviços.

## Production notes

- Defina DJANGO_ENV=production e DJANGO_SETTINGS_MODULE=config.settings.production
- Certifique-se de que SECRET_KEY e ALLOWED_HOSTS estejam definidos por meio de variáveis ​​de ambiente
- Use um proxy reverso para a terminação TLS
- Execute com os workers gunicorn e uvicorn

Exemplo de comando de produção:

```bash
gunicorn config.wsgi:application -c tools/gunicorn.conf.py
```
