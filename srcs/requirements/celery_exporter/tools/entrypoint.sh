#!/bin/sh
set -e

# Generate dynamic TLS certificates for HTTPS support
/usr/local/bin/generate_cert.sh celery-exporter "celery-exporter,localhost,127.0.0.1"

if [ ! -f /run/secrets/redis_credenciais ]; then
  echo "Redis exporter credentials not found" >&2
  exit 1
fi

REDIS_PASSWORD=$(sed -n '1p' /run/secrets/redis_credenciais | cut -d'=' -f2 | tr -d '\r')

if [ -z "$REDIS_PASSWORD" ]; then
  echo "Redis exporter password is empty" >&2
  exit 1
fi

REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_USER="${REDIS_USER:-bidlive}"

export CE_BROKER_URL="redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/1"

echo "Starting Celery Exporter locally on 127.0.0.1:9809..."
/app/.venv/bin/python /app/cli.py --broker-url="${CE_BROKER_URL}" --host=127.0.0.1 --port=9809 &

echo "Starting TLS proxy on 0.0.0.0:9808..."
exec python3 /tls_proxy.py
