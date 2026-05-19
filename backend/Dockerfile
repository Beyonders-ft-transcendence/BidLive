FROM python:3.12-alpine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_PROJECT_ENVIRONMENT=/app/.venv

RUN apk add --no-cache \
    build-base \
    netcat-openbsd \
    postgresql-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev \
    curl

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install --no-cache-dir uv

RUN uv sync --frozen

COPY . .

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uv", "run", "gunicorn", "config.asgi:application", "-k", "uvicorn.workers.UvicornWorker", "-c", "tools/gunicorn.conf.py"]
