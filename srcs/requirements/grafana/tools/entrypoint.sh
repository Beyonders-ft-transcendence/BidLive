#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh grafana "grafana,localhost,127.0.0.1"

# Make certs readable by grafana user (uid 472)
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true

echo "Starting Grafana..."

if [ -f /run/secrets/grafana_credenciais ]; then
  export GF_SECURITY_ADMIN_USER=$(sed -n '1p' /run/secrets/grafana_credenciais | cut -d'=' -f2 | tr -d '\r')
  export GF_SECURITY_ADMIN_PASSWORD=$(sed -n '2p' /run/secrets/grafana_credenciais | cut -d'=' -f2 | tr -d '\r')
fi

if [ -f /run/secrets/elasticsearch_credenciais ]; then
  export GF_ELASTICSEARCH_PASSWORD=$(grep "^ELASTIC_PASSWORD=" /run/secrets/elasticsearch_credenciais | cut -d'=' -f2- | tr -d '\r')
fi

export GF_PATHS_DATA="${GF_PATHS_DATA:-/var/lib/grafana}"
export GF_PATHS_LOGS="${GF_PATHS_LOGS:-/var/log/grafana}"
export GF_SERVER_HTTP_PORT="${GF_SERVER_HTTP_PORT:-3001}"
export GF_SERVER_ROOT_URL="${GF_SERVER_ROOT_URL:-https://bidlive.42.fr/grafana/}"
export GF_SERVER_SERVE_FROM_SUB_PATH="${GF_SERVER_SERVE_FROM_SUB_PATH:-true}"

# Configure Grafana HTTPS using generated certificates
export GF_SERVER_PROTOCOL=https
export GF_SERVER_CERT_FILE=/etc/ssl/certs/server.crt
export GF_SERVER_CERT_KEY=/etc/ssl/private/server.key

# Drop to grafana user for the main process
exec su -s /bin/sh grafana -c '/run.sh'
