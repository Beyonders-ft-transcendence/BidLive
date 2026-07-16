#!/bin/sh
set -e

/usr/local/bin/generate_cert.sh postgres-exporter "postgres-exporter,localhost,127.0.0.1"

if [ ! -f /run/secrets/db_credenciais ]; then
  echo "Postgres exporter credentials not found" >&2
  exit 1
fi

DATABASE_PASSWORD=$(sed -n '1p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')

if [ -z "$DATABASE_PASSWORD" ]; then
  echo "Postgres exporter password is empty" >&2
  exit 1
fi

DATABASE_HOST="${DATABASE_HOST:-postgres}"
DATABASE_PORT="${DATABASE_PORT:-5432}"
DATABASE_DB="${DATABASE_DB:-bidlive}"
DATABASE_USER="${DATABASE_USER:-bidlive}"
DATABASE_SSLMODE="${DATABASE_SSLMODE:-disable}"

export DATA_SOURCE_NAME="host=${DATABASE_HOST} port=${DATABASE_PORT} user=${DATABASE_USER} password=${DATABASE_PASSWORD} dbname=${DATABASE_DB} sslmode=${DATABASE_SSLMODE}"

cat > /etc/ssl/certs/web-config.yml <<EOF
tls_server_config:
  cert_file: /etc/ssl/certs/server.crt
  key_file: /etc/ssl/private/server.key
EOF

exec postgres_exporter --web.config.file=/etc/ssl/certs/web-config.yml "$@"
