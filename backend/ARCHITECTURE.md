# Arquitetura e Organizacao do Backend

Este documento descreve como o backend do projeto BidLive esta organizado hoje, quais responsabilidades cada camada possui e quais convencoes seguimos no codigo.

## Visao geral

O backend e uma aplicacao Django + Django REST Framework organizada por dominio em `apps/`. A ideia principal e manter cada contexto de negocio isolado, com regras claras para:

- configuracao do projeto
- roteamento HTTP
- logica de negocio
- consultas reutilizaveis
- codigo compartilhado

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
  core/               # Nucleo minimo do pacote, sem dominio de negocio
  infrastructure/     # Integracoes e infraestrutura compartilhada
  scripts/            # Scripts utilitarios
  tests/              # Suite de testes do backend
  tools/              # Arquivos operacionais e de deploy
  manage.py
```

## Componentes e responsabilidades

### `config/`

Responsavel pelo bootstrap do Django:

- `config/settings/base.py`: configuracao base do projeto
- `config/settings/development.py`: ajustes de desenvolvimento
- `config/settings/production.py`: ajustes de producao
- `config/urls.py`: urls globais do projeto
- `config/asgi.py`: entrada ASGI
- `config/wsgi.py`: entrada WSGI
- `config/celery.py`: configuracao do Celery

### `api/`

Camada fina de roteamento global da API:

- `api/urls.py`: agrega endpoints como `health/`, `auth/`, `domain/` e rotas de RBAC
- `api/health.py`: healthcheck do servico

Essa pasta nao deve concentrar regra de negocio; ela apenas conecta as rotas publicas aos apps corretos.

### `apps/`

Cada pasta dentro de `apps/` representa um dominio do sistema. Exemplos atuais:

- `apps.users`: autenticacao, usuarios, roles, permissions e OAuth
- `apps.domain`: projetos e seu fluxo principal
- `apps.auctions`: leiloes, lances e livestreams
- `apps.access`, `apps.social`, `apps.chat`, `apps.notifications`, `apps.storage`, `apps.analytics`, `apps.reports`: dominios auxiliares ou ainda em expansao

Arquivos comuns em um app:

- `models.py`: entidades e regras de persistencia
- `serializers.py`: validacao e serializacao HTTP
- `views.py`: endpoints e orquestracao da request
- `services.py`: regras de negocio
- `selectors.py`: queries e leituras reutilizaveis
- `filters.py`: filtros do Django Filter / DRF
- `permissions.py`: permissoes especificas do dominio
- `tasks.py`: tarefas assicronas com Celery
- `managers.py`: managers customizados de modelos

Nem todo app precisa ter todas essas camadas desde o inicio. Elas sao adicionadas conforme o dominio cresce.

### `common/`

Codigo transversal compartilhado pelo projeto:

- `common.exceptions`: handler global de excecoes do DRF
- `common.renderers`: formato padrao das respostas JSON
- `common.responses`: helpers para `success_response` e `error_response`
- `common.pagination`: paginacao padronizada
- `common.permissions`: permissoes base reutilizaveis
- `common.middleware`: middleware compartilhado, como request id
- `common.models`: modelos base compartilhados

### `infrastructure/`

Espaco reservado para integracoes e adaptadores de infraestrutura compartilhados entre dominios, como cache, storage, filas ou clientes externos quando fizer sentido centralizar.

### `tests/`

Suite principal de testes de integracao e API do backend.

Hoje os testes ficam centralizados em:

- `tests/conftest.py`
- `tests/test_auth_api.py`
- `tests/test_rbac_api.py`
- `tests/test_domain_api.py`
- `tests/test_google_auth_api.py`
- `tests/test_42_auth_api.py`
- `tests/test_health.py`
- `tests/test_documentation_routes.py`

## Estrutura do app `users`

O dominio `users` foi consolidado em `apps/users` e concentra:

- autenticacao JWT
- cadastro e login
- refresh e logout
- alteracao e reset de senha
- OAuth com Google e 42
- RBAC com usuarios, roles e permissions
- middleware de auditoria de autorizacao

Isso substitui a organizacao antiga em `core/users`.

## Estrutura do app `domain`

`apps/domain` contem o fluxo principal de projetos:

- `models.py`: entidades do dominio
- `views.py`: `ProjectViewSet`
- `serializers.py`: serializacao do recurso
- `services.py`: criacao e atualizacao de projetos
- `filters.py`: filtros do endpoint
- `permissions.py`: regras de acesso
- `tasks.py`: tarefas assicronas relacionadas ao dominio

## Estrutura do app `auctions`

`apps/auctions` concentra a logica de leiloes:

- `models.py`: `Auction`, `AuctionItem`, `Bid`, `LiveStream`
- `services.py`: regras como colocacao de lances
- `selectors.py`: leituras reutilizaveis
- `serializers.py`: representacao HTTP

## Fluxo tipico de uma request

1. A request entra por `ASGI` ou `WSGI`.
2. `config/urls.py` encaminha `/api/` para `api/urls.py`.
3. Middlewares globais executam preocupacoes transversais.
4. O DRF autentica o usuario, normalmente com `JWTAuthentication`.
5. A view valida a entrada com serializer.
6. A view delega a regra de negocio para `services.py`.
7. Se necessario, consultas reutilizaveis sao feitas via `selectors.py` ou `managers.py`.
8. A resposta e padronizada por `common.renderers` e `common.responses`.

## Roteamento atual

Hoje o roteamento principal esta dividido assim:

- `config/urls.py`: expoe `admin/`, `api/`, `api/schema/`, `api/docs/`, `api/redoc/`
- `api/urls.py`: expoe `health/`, rotas de autenticacao e endpoints de usuarios/RBAC

Exemplos de endpoints atuais:

- `/api/health/`
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
- middlewares e servicos de auditoria para eventos de autorizacao

O modelo de usuario continua sendo:

```python
AUTH_USER_MODEL = "users.User"
```

Isso permanece valido porque o app `apps.users` usa o label `users`.

## Serializacao e validacao

A validacao de entrada e serializacao de saida fica em `serializers.py`.

Principios adotados:

- serializer valida request data
- view orquestra
- service executa a regra
- model persiste

Evita-se colocar regra de negocio relevante dentro da view.

## Regras de negocio

As regras de negocio devem ficar preferencialmente em `services.py`.

Exemplos no projeto:

- autenticacao e emissao de tokens em `apps/users/services.py`
- fluxo OAuth em `apps/users/oauth_service.py`
- atualizacao de roles e permissions em services do dominio `users`
- criacao e atualizacao de projetos em `apps/domain/services.py`
- colocacao de lances em `apps/auctions/services.py`

## Queries e acesso a dados

Consultas mais complexas devem ser isoladas em:

- `selectors.py`
- `managers.py`

Isso melhora:

- reuso
- legibilidade
- testabilidade

## Middleware

Middlewares importantes hoje:

- `common.middleware.RequestIDMiddleware`
- `apps.users.middleware.authorization.AuthorizationAuditMiddleware`

Eles lidam com preocupacoes transversais, sem poluir a camada de views.

## Cache e throttling

- cache padrao configurado em `CACHES`
- em desenvolvimento usamos cache local em memoria
- throttling padrao do DRF e throttles especificos de auth sao usados para proteger login, cadastro e fluxo de senha

## Assincrono

O projeto usa Celery para tarefas assicronas:

- broker e backend configurados em `config/celery.py` e settings
- tarefas por dominio podem viver em `tasks.py`

Exemplo atual:

- `apps.domain.tasks.sample_heartbeat`

## Documentacao da API

O projeto usa `drf-spectacular` para OpenAPI.

Rotas disponiveis:

- `/api/schema/`
- `/api/docs/`
- `/api/redoc/`

## Configuracao por ambiente

- `base.py`: configuracao padrao
- `development.py`: debug, cache local e email em console
- `production.py`: configuracoes endurecidas para producao

## Convencoes do projeto

- organizar codigo por dominio em `apps/`
- manter `api/` como agregador fino de rotas
- colocar regra de negocio em `services.py`
- mover queries reutilizaveis para `selectors.py` ou `managers.py`
- usar `common/` para responsabilidades compartilhadas
- evitar duplicar logica entre views e serializers

## Como navegar no codigo

Se quiseres encontrar algo rapidamente:

- autenticacao e usuarios: `apps/users/`
- projetos: `apps/domain/`
- leiloes: `apps/auctions/`
- respostas e excecoes padronizadas: `common/`
- settings e bootstrap: `config/`
- testes de API: `tests/`

## Proximos passos de organizacao

A base atual ja esta alinhada com a organizacao por dominio, mas ainda pode evoluir para:

- mover a camada HTTP de alguns apps para subpastas `api/`
- simplificar mais `api/urls.py` para ficar apenas como agregador
- padronizar melhor a separacao interna de auth e RBAC dentro de `apps/users`

---

Se quiser, posso atualizar o proximo passo tambem e reorganizar `apps/users` em `api/auth_views.py`, `api/rbac_views.py`, `api/auth_serializers.py` e `api/rbac_serializers.py`.
