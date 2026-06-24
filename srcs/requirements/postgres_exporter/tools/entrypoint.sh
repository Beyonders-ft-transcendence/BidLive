#!/bin/sh
set -e

if [ ! -f /run/secrets/db_credenciais ]; then
  echo "Postgres exporter credentials not found" >&2
  exit 1
fi

POSTGRES_PASSWORD=$(sed -n '1p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')

if [ -z "$POSTGRES_PASSWORD" ]; then
  echo "Postgres exporter password is empty" >&2
  exit 1
fi

POSTGRES_EXPORTER_DB_HOST="${POSTGRES_EXPORTER_DB_HOST:-postgresql}"
POSTGRES_EXPORTER_DB_PORT="${POSTGRES_EXPORTER_DB_PORT:-5432}"
POSTGRES_EXPORTER_DB_NAME="${POSTGRES_EXPORTER_DB_NAME:-bidlive}"
POSTGRES_EXPORTER_DB_USER="${POSTGRES_EXPORTER_DB_USER:-bidlive}"
POSTGRES_EXPORTER_SSLMODE="${POSTGRES_EXPORTER_SSLMODE:-disable}"

export DATA_SOURCE_NAME="host=${POSTGRES_EXPORTER_DB_HOST} port=${POSTGRES_EXPORTER_DB_PORT} user=${POSTGRES_EXPORTER_DB_USER} password=${POSTGRES_PASSWORD} dbname=${POSTGRES_EXPORTER_DB_NAME} sslmode=${POSTGRES_EXPORTER_SSLMODE}"

unset POSTGRES_PASSWORD

exec postgres_exporter "$@"
