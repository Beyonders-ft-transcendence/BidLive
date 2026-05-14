# Arquitetura e Organizacao do Backend

Este documento descreve como o backend do projeto BidLive esta organizado e o por que das escolhas de estruturacao. O objetivo e detalhar o fluxo de dados, camadas, responsabilidades e convencoes usadas no codigo.

## Visao geral

O backend e uma aplicacao Django modular organizada por dominios (apps). A separacao por apps facilita manutencao, testes, reuso e escalabilidade. Cada app contem codigo relacionado a um dominio de negocio (ex.: auctions, projects, chat) e segue uma convencao consistente.

## Estrutura principal (pasta backend/)

```
backend/
├─ api/                # Entrypoints HTTP (routers/urls) e versoes da API
├─ apps/               # Apps Django por dominio (models, serializers, views...)
│  ├─ auctions/
│  ├─ chat/
│  ├─ projects/
│  └─ ...
├─ common/             # Utilitarios compartilhados: middleware, exceptions, renderers
├─ config/             # Configuracao do projeto: settings, wsgi/asgi, celery
├─ core/               # Codigo central como users e integracoes internas
├─ infrastructure/     # Infra e integracoes externas (cache, fila, storage adapters)
├─ scripts/            # Scripts utilitarios e helpers para deploy e manutencao
├─ tests/              # Testes do backend (integracao e unidade)
├─ tools/              # Arquivos e configs de operacao (entrypoint, gunicorn)
└─ manage.py
```

## Componentes e responsabilidades

### api/
Camada de roteamento HTTP e versionamento da API.

- `api/urls.py`: entrypoint principal `/api/`.
- `api/v1/urls.py`: rotas versionadas (ex.: `/api/v1/`).
- `api/v1/health.py`: endpoint de healthcheck.

### apps/
Cada app representa um dominio e segue uma estrutura padrao:

- `models.py`: entidades e regras de integridade (constraints, choices, indexes).
- `serializers.py`: validacao e conversao para JSON (entrada e saida).
- `views.py` / `viewsets.py`: endpoints, permissoes e orquestracao de fluxo.
- `services.py`: regras de negocio e orquestracao (ex.: criar entidade, executar transacao).
- `selectors.py` / `managers.py`: queries e filtros reutilizaveis.
- `tasks.py`: tarefas async (Celery).
- `permissions.py`: regras de acesso especificas do dominio.

Exemplo de fluxo tipico:

1. `ViewSet` recebe request.
2. `Serializer` valida dados.
3. `Service` aplica regras de negocio e persiste.
4. `Selector/Manager` encapsula consultas.
5. `Serializer` monta resposta.

### common/
Codigo transversal e compartilhado:

- `exceptions.py`: handler global de erros do DRF (formato padronizado).
- `middleware.py`: middleware de request-id.
- `renderers.py`: renderer de resposta padrao.
- `pagination.py`: paginacao padronizada.
- `responses.py`: utilitarios de resposta.
- `permissions.py`: permissao base ou utilitaria.

### config/
Configuracao do Django:

- `settings/base.py`: configuracoes comuns (apps, middleware, DRF, cache, logging).
- `settings/development.py`: overrides para dev local.
- `settings/production.py`: overrides para prod.
- `asgi.py`: entrypoint ASGI.
- `wsgi.py`: entrypoint WSGI.
- `celery.py`: configuracao do Celery.
- `urls.py`: inclui admin, api, schema e docs.

### core/
Dominio central compartilhado (ex.: `core/users`). Normalmente concentra o modelo de usuario e autenticacao.

### infrastructure/
Adaptadores e integracoes externas. Mantem dependencias externas desacopladas da regra de negocio.

### tests/
Testes de unidade e integracao com pytest, fixtures em `tests/conftest.py`.

## Fluxo de request (alto nivel)

1. Request chega no ASGI/WSGI.
2. Middleware aplica cross-cutting (ex.: request-id, CORS).
3. DRF autentica usuario (`JWTAuthentication`).
4. DRF aplica permissao (`IsAuthenticated`, `IsOwnerOrAdmin`).
5. View executa valida e delega para services/selectors.
6. Resposta padronizada por renderer/exception handler.

## Autenticacao e autorizacao

- JWT via `rest_framework_simplejwt`.
- Permissoes padrao: `IsAuthenticated`.
- Regras por dominio em `apps/<app>/permissions.py`.

## Serializacao e validacao

- `serializers.py` valida entrada e define saida.
- Serializers sao a fronteira entre request e modelo.

## Regras de negocio

- Implementadas em `services.py`.
- Evita codigo de negocio dentro de views e models.

## Queries

- Queries complexas isoladas em `selectors.py` ou `managers.py`.
- Facilita reuso e testes.

## Cache e throttling

- Cache padrao configurado via `CACHES`.
- Throttling padrao do DRF configurado em `REST_FRAMEWORK`.
- Em `development.py`, cache local para evitar dependencia de Redis no host.

## Assincrono (Celery)

- `celery.py` configura broker e backend.
- `tasks.py` em cada app define rotinas async.
- Workers e beat configurados em Docker/CLI.

## Observabilidade

- Logging configurado em `LOGGING`.
- Middleware de request-id gera `X-Request-ID` para correlacao.

## Documentacao da API

- OpenAPI via drf-spectacular.
- Endpoints:
  - `/api/schema/` (schema)
  - `/api/docs/` (Swagger UI)

## Configuracao por ambiente

- `base.py` contem padroes e defaults.
- `development.py` ajusta debug e cache local.
- `production.py` exige variaveis de ambiente e endurece configuracoes.

## Por que essa estrutura (racional)

- Escalabilidade: apps isolados facilitam paralelizacao.
- Manutencao: codigo por dominio reduz curva de aprendizado.
- Testabilidade: services/selectors sao facilmente testaveis.
- Reuso: common/infrastructure evitam duplicacao.

## Como navegar e contribuir

- Logica de negocio: `apps/<nome>/services.py`.
- Queries: `apps/<nome>/selectors.py`.
- Endpoints: `api/v1/` e `apps/<nome>/views.py`.
- Config: `config/settings/`.

## Boas praticas

- Coloque regra de negocio em services, nao em views.
- Evite queries complexas em views; use selectors/managers.
- Padronize respostas via renderer e exceptions.
- Adicione testes para novos services e endpoints.

---

Se quiser, posso gerar um diagrama Mermaid com o fluxo request->view->service->model ou detalhar um app especifico (ex.: auctions) com exemplos de fluxo de dados.
