#!/bin/sh
set -e

/usr/local/bin/generate_cert.sh redis-exporter "redis-exporter,localhost,127.0.0.1"

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

export REDIS_ADDR="redis://${REDIS_HOST}:${REDIS_PORT}"
export REDIS_USER="${REDIS_USER}"
export REDIS_PASSWORD

exec redis_exporter "$@"
