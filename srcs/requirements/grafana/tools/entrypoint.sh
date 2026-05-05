#!/bin/sh
set -e

echo "Starting Grafana..."

# usa secrets ou env var
if [ -f /run/secrets/grafana_password ]; then
  export GF_SECURITY_ADMIN_PASSWORD=$(cat /run/secrets/grafana_password)
fi

exec grafana-server \
  --homepath=/usr/share/grafana \
  --config=/etc/grafana/grafana.ini \
  cfg:default.paths.data=/var/lib/grafana \
  cfg:default.paths.logs=/var/log/grafana \
  cfg:default.server.http_port=3000