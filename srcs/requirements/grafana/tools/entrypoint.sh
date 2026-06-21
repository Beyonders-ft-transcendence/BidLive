#!/bin/sh
set -e

echo "Starting Grafana..."

if [ -f /run/secrets/grafana_password ]; then
  export GF_SECURITY_ADMIN_PASSWORD=$(cat /run/secrets/grafana_password)
fi

export GF_PATHS_DATA="${GF_PATHS_DATA:-/var/lib/grafana}"
export GF_PATHS_LOGS="${GF_PATHS_LOGS:-/var/log/grafana}"
export GF_SERVER_HTTP_PORT="${GF_SERVER_HTTP_PORT:-3000}"

exec /run.sh
