#!/bin/sh
set -e

echo "Starting Grafana..."

if [ -f /run/secrets/grafana_credenciais ]; then
  export GF_SECURITY_ADMIN_USER=$(sed -n '1p' /run/secrets/grafana_credenciais | cut -d'=' -f2 | tr -d '\r')
  export GF_SECURITY_ADMIN_PASSWORD=$(sed -n '2p' /run/secrets/grafana_credenciais | cut -d'=' -f2 | tr -d '\r')
fi

export GF_PATHS_DATA="${GF_PATHS_DATA:-/var/lib/grafana}"
export GF_PATHS_LOGS="${GF_PATHS_LOGS:-/var/log/grafana}"
export GF_SERVER_HTTP_PORT="${GF_SERVER_HTTP_PORT:-3001}"
export GF_SERVER_ROOT_URL="${GF_SERVER_ROOT_URL:-https://bidlive.42.fr/grafana/}"
export GF_SERVER_SERVE_FROM_SUB_PATH="${GF_SERVER_SERVE_FROM_SUB_PATH:-true}"

exec /run.sh
