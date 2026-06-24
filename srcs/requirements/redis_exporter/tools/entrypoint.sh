#!/bin/sh
set -e

if [ ! -f /run/secrets/redis_credenciais ]; then
  echo "Redis exporter credentials not found" >&2
  exit 1
fi

REDIS_PASSWORD=$(sed -n '1p' /run/secrets/redis_credenciais | cut -d'=' -f2 | tr -d '\r')

if [ -z "$REDIS_PASSWORD" ]; then
  echo "Redis exporter password is empty" >&2
  exit 1
fi

REDIS_EXPORTER_REDIS_HOST="${REDIS_EXPORTER_REDIS_HOST:-redis}"
REDIS_EXPORTER_REDIS_PORT="${REDIS_EXPORTER_REDIS_PORT:-6379}"
REDIS_EXPORTER_REDIS_USER="${REDIS_EXPORTER_REDIS_USER:-bidlive}"

export REDIS_ADDR="redis://${REDIS_EXPORTER_REDIS_HOST}:${REDIS_EXPORTER_REDIS_PORT}"
export REDIS_USER="${REDIS_EXPORTER_REDIS_USER}"
export REDIS_PASSWORD

exec redis_exporter "$@"
