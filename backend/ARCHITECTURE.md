# Arquitetura e Organizacao do Backend

Este documento descreve a estrutura atual do backend do projeto BidLive e as convencoes usadas para manter o codigo limpo, previsivel e facil de evoluir.

## Visao geral

O backend e uma aplicacao Django + Django REST Framework organizada por dominio em `apps/`. A estrutura prioriza:

- separacao por contexto de negocio
- configuracao centralizada
- views finas
- regras de negocio em services
- consultas reutilizaveis fora das views

## Estrutura principal

```text
backend/
  api/                # Agregacao de rotas HTTP e endpoints globais
  apps/               # Apps Django por dominio
    access/
    analytics/
    auctions/
    chat/
    domain/
    notifications/
    reports/
    social/
    storage/
    users/
  common/             # Codigo transversal compartilhado
  config/             # Settings, urls globais, celery, wsgi, asgi
  infrastructure/     # Integracoes e infraestrutura compartilhada
  scripts/            # Scripts utilitarios
  tests/              # Testes do backend
  tools/              # Arquivos operacionais
  manage.py
```

## Camadas e responsabilidades

### `config/`

Responsavel pelo bootstrap da aplicacao:

- `config/settings/`: configuracao por ambiente
- `config/urls.py`: urls globais
- `config/asgi.py` e `config/wsgi.py`: pontos de entrada
- `config/celery.py`: configuracao do Celery

### `api/`

Camada fina de roteamento global da API.

- `api/urls.py` agrega endpoints como `health/`, `auth/`, `domain/`, `users/`, `roles/` e `permissions/`
- `api/health.py` expoe o healthcheck

Essa pasta deve apenas conectar rotas aos apps corretos, sem concentrar regra de negocio.

### `apps/`

Cada app representa um dominio do sistema.

Exemplos atuais:

- `apps.users`: autenticacao, usuarios, roles, permissions e OAuth
- `apps.domain`: projetos
- `apps.auctions`: leiloes, itens, lances e livestreams
- `apps.access`, `apps.social`, `apps.chat`, `apps.notifications`, `apps.storage`, `apps.analytics`, `apps.reports`: dominios auxiliares ou em expansao

Arquivos comuns dentro de um app:

- `models.py`: entidades e persistencia
- `serializers.py`: validacao e serializacao HTTP
- `views.py`: endpoints e orquestracao da request
- `services.py`: regras de negocio
- `selectors.py`: queries reutilizaveis
- `filters.py`: filtros para listagens
- `permissions.py`: regras de acesso do dominio
- `tasks.py`: tarefas assicronas
- `managers.py`: managers customizados

Nem todo app precisa ter todas essas camadas desde o inicio. Elas aparecem conforme o dominio cresce.

### `common/`

Codigo transversal compartilhado por todo o projeto:

- `exceptions.py`: handler global de excecoes
- `renderers.py`: padronizacao do JSON de resposta
- `responses.py`: helpers de sucesso e erro
- `pagination.py`: paginacao padrao
- `permissions.py`: permissoes reutilizaveis
- `middleware.py`: middleware compartilhado
- `models.py`: bases comuns quando necessario

### `tests/`

Suite principal de testes do backend, com foco em integracao e API.

## Dominios principais

### `apps/users`

Concentra:

- autenticacao JWT
- cadastro, login, refresh e logout
- alteracao e reset de senha
- OAuth com Google e 42
- RBAC com usuarios, roles e permissions
- auditoria de autorizacao

### `apps/domain`

Concentra o fluxo principal de projetos:

- entidades do dominio
- serializers e views do recurso
- regras de criacao e atualizacao
- filtros e permissoes
- tarefas assicronas relacionadas ao dominio

### `apps/auctions`

Concentra a logica de leiloes:

- `Auction`
- `AuctionItem`
- `Bid`
- `LiveStream`

As regras de dominio ficam principalmente em `services.py` e as leituras reutilizaveis em `selectors.py`.

## Fluxo tipico de request

1. A request entra por `ASGI` ou `WSGI`.
2. `config/urls.py` encaminha `/api/` para `api/urls.py`.
3. Middlewares globais executam preocupacoes transversais.
4. O DRF autentica o usuario.
5. A view valida a entrada com serializer.
6. A view delega a regra de negocio para `services.py`.
7. Queries mais complexas usam `selectors.py` ou `managers.py`.
8. A resposta e padronizada por `common.renderers` e `common.responses`.

## Roteamento

O roteamento principal esta dividido assim:

- `config/urls.py`: `admin/`, `api/`, `api/schema/`, `api/docs/`, `api/redoc/`
- `api/urls.py`: endpoints funcionais da API

Exemplos de rotas atuais:

- `/api/auth/register/`
- `/api/auth/login/`
- `/api/auth/refresh/`
- `/api/auth/google/`
- `/api/auth/42/`
- `/api/domain/`
- `/api/users/`
- `/api/roles/`
- `/api/permissions/`

## Autenticacao e autorizacao

O projeto usa:

- JWT com `rest_framework_simplejwt`
- `IsAuthenticated` como permissao padrao da API
- RBAC no dominio `users`

O modelo de usuario do projeto e:

```python
AUTH_USER_MODEL = "users.User"
```

## Convencoes de implementacao

- organizar codigo por dominio em `apps/`
- manter `api/` como agregador fino de rotas
- colocar regra de negocio em `services.py`
- evitar queries complexas em views
- mover leituras reutilizaveis para `selectors.py` ou `managers.py`
- usar `common/` para responsabilidades compartilhadas
- manter views finas e serializers focados em validacao/representacao

## Middleware, cache e tarefas

Middlewares importantes:

- `common.middleware.RequestIDMiddleware`
- `apps.users.middleware.authorization.AuthorizationAuditMiddleware`

Infraestrutura relevante:

- cache configurado em `CACHES`
- throttling padrao do DRF e throttles especificos de autenticacao
- Celery para tarefas assicronas por dominio

## Documentacao da API

O projeto usa `drf-spectacular` para OpenAPI.

Rotas disponiveis:

- `/api/schema/`
- `/api/docs/`
- `/api/redoc/`

## Como navegar no codigo

- autenticacao e usuarios: `apps/users/`
- projetos: `apps/domain/`
- leiloes: `apps/auctions/`
- respostas e excecoes padronizadas: `common/`
- configuracao e bootstrap: `config/`
- testes: `tests/`
