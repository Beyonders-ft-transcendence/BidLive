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

Open http://localhost:8000/api/redoc/

Observações do ambiente local:

- O backend usa `config.settings.development` quando roda via `runserver`/`uvicorn`, então o cache local não depende de Redis para abrir `/api/schema/` e `/api/docs/`.
- PostgreSQL precisa estar disponível em `localhost:5432` ou no `DATABASE_URL` configurado no seu `.env`.
- Redis só é necessário para tarefas assíncronas do Celery e integrações que dependem dele.

## Docker (dev)

```bash
docker compose up --build
```

## Containers (sem Compose)

```bash
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine

docker run -d --name postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=bidlive \
  -e POSTGRES_USER=bidlive \
  -e POSTGRES_PASSWORD=bidlive \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
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

- OpenAPI schema (raw JSON/YAML): /api/schema/
- Redoc UI (not interactive docs): /api/redoc/
- Swagger UI (interactive docs): /api/docs/

Access (development local):

- Execute o servidor de desenvolvimento:

```bash
# from backend/
uv run python manage.py runserver
```

- Abra no seu navegador:

  - OpenAPI schema: http://localhost:8000/api/schema/
  - Redoc UI: http://localhost:8000/api/redoc/
  - Swagger UI: http://localhost:8000/api/docs/

Access (Docker / Compose):

- Start containers:

```bash
docker compose up --build
```

Em seguida, abra `http://localhost:8000/api/docs/` (ou o host/porta mapeado pela sua configuração do Compose).

Notes:

- Se sua implantação usa um proxy reverso ou uma porta diferente, substitua `localhost:8000` pelo host e porta expostos externamente.
- Se a interface do Swagger estiver protegida por autenticação em seu ambiente, faça login primeiro ou use um token de API, conforme necessário.
- Para obter o esquema bruto programaticamente:

```bash
curl -s http://localhost:8000/api/schema/ | jq .
```

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
gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker -c tools/gunicorn.conf.py
```
