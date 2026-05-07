FROM alpine:3.22

# evitar problemas com logs/output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    netcat-openbsd \
    postgresql-dev \
    libffi-dev \
    jpeg-dev \
    zlib-dev

WORKDIR /app

# copiar requirements primeiro (cache otimizado)
COPY requirements.txt .

RUN python3 -m venv .venv && \
    . .venv/bin/activate && \
     pip install --no-cache-dir --upgrade pip && \
     pip install --no-cache-dir -r requirements.txt

# copiar projeto
COPY . .

# entrypoint
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]