FROM alpine:3.22

RUN apk add --no-cache \
    build-base \
    netcat-openbsd \
    postgresql-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev \
    curl \
    make \
    python3 py3-pip

RUN id -u appuser >/dev/null 2>&1 || adduser -D appuser

RUN mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_PROJECT_ENVIRONMENT=/app/.venv

COPY --chown=appuser:appuser pyproject.toml uv.lock README.md ./

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

RUN uv sync --frozen

COPY --chown=appuser:appuser . .

ENV PATH="/app/.venv/bin:$PATH"

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
