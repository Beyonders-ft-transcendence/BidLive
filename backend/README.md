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

3) Execute as migrações, popule dados demo e inicie o servidor.

```bash
uv run python manage.py migrate
make seed
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

docker run -d --name livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 5000-5100:5000-5100/udp \
  livekit/livekit-server:latest \
  --dev \
  --bind 0.0.0.0
```

## Main commands (uv)

```bash
uv sync
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py seed
uv run python manage.py runserver 0.0.0.0:8000
uv run pytest -q
uv run celery -A config worker -l info
uv run celery -A config beat -l info
```

## Seed demo (`make seed`)

Comando para popular o banco com dados de desenvolvimento alinhados ao `frontend/src/data/mockData.ts`. Útil para conectar o frontend à API real sem depender de mocks locais.

```bash
make seed          # cria dados demo (idempotente)
make seed-clear    # remove todos os registros @bidlive.dev
```

Opções extras:

```bash
uv run python manage.py seed --force              # recria tudo do zero
uv run python manage.py seed --password minha123  # senha customizada
```

### O que é criado

| Recurso | Origem no mock | Quantidade |
|---------|----------------|------------|
| Usuários | `INITIAL_USERS` + `CURRENT_LOCAL_USER` | 4 |
| Leilões | `INITIAL_AUCTIONS` (auc-1 .. auc-5) | 5 |
| Lances | `INITIAL_BIDS` + histórico dos leilões | vários |
| Streams | `INITIAL_STREAMS` (str-1, str-2) | 2 LIVE |
| Mensagens de chat | `INITIAL_MESSAGES` | 3 |
| Notificações | `INITIAL_NOTIFICATIONS` | 3 |
| Reports | `INITIAL_REPORTS` | 1 |
| Eventos analytics | `INITIAL_SYSTEM_LOGS` | 3 |
| Domínios / amizades | extras para navegação | 2 / 3 |

Horários (`startTime`, `endTime`, lances, mensagens) são calculados relativos a `timezone.now()`, igual ao `getDateOffset()` do frontend.

### Contas demo

Senha padrão: `demo1234`

| Email | Papel mock | Backend | Password |
|-------|------------|---------|---------|
| `admin@bidlive.dev` | ADMIN / u-current | SUPER_ADMIN | demo1234 |
| `seller@bidlive.dev` | USER / u-2 (Ana Silva) | USER | demo1234 |
| `manager@bidlive.dev` | MANAGER / u-3 (Carlos) | MONITOR | demo1234 |
| `banned@bidlive.dev` | USER / u-4 (Beatriz) | USER (BANNED) | demo1234 |

Login: `POST /api/auth/login/` com `email` e `password`.

> Os emails usam o domínio `@bidlive.dev` para facilitar limpeza (`make seed-clear`). O conteúdo (títulos, descrições, imagens, valores) segue o `mockData.ts`.

## Imagens: upload ou URL externa

Endpoints que aceitam arquivos (ex.: criar/atualizar leilão, thumbnail de stream) suportam **dois modos**:

| Entrada | Comportamento |
|---------|----------------|
| Arquivo binário (`images` em `multipart/form-data`) | Upload normal para o storage |
| URL `http://` ou `https://` | Grava apenas o link em `files.url` (sem upload) |

### Leilões

- **Multipart:** envie arquivos em `images` e/ou URLs em `image_urls`
- **JSON:** envie URLs em `images` (lista de strings) ou em `image_urls`

```json
{
  "title": "Rolex Daytona",
  "image_urls": ["https://images.unsplash.com/photo-1547996160-81dfa63595aa"]
}
```

### Streams

- `thumbnail` — arquivo (multipart)
- `thumbnail_url` — URL externa
- `thumbnail_id` — ID de um `File` já existente

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
