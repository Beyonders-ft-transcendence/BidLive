# BidLive Backend

Base do backend em FastAPI usando `uv` e uma organização MVC simples.

## Estrutura

- `src/routes/`: camada HTTP
- `src/controllers/`: orquestração e regras de negócio
- `src/services/`: lógica de domínio e acesso a dados
- `src/database/`: `SQLAlchemy` e modelos
- `migration/`: migrações do Alembic
- `test/`: testes automatizados

## Como rodar

```bash
uv sync
uv run uvicorn src.app:app --reload
```

## Migrações

```bash
uv run alembic revision --autogenerate -m "initial"
uv run alembic upgrade head
```
