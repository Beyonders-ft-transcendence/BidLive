#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh kibana "kibana,localhost,127.0.0.1"

# Make certs readable by kibana user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true
chmod 755 /etc/ssl/private 2>/dev/null || true

# Load Elasticsearch credentials from Secret
if [ -f /run/secrets/elasticsearch_credenciais ]; then
    export ELASTIC_PASSWORD=$(grep "^ELASTIC_PASSWORD=" /run/secrets/elasticsearch_credenciais | cut -d'=' -f2- | tr -d '\r')
fi

echo "Waiting for Elasticsearch to be ready..."
until curl -sk -u "elastic:${ELASTIC_PASSWORD}" https://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    echo "  Elasticsearch not ready yet, retrying in 5s..."
    sleep 5
done
echo "✅ Elasticsearch is ready."

echo "Setting password for kibana_system user..."
curl -sk -u "elastic:${ELASTIC_PASSWORD}" -X POST "https://elasticsearch:9200/_security/user/kibana_system/_password" -H "Content-Type: application/json" -d "{\"password\": \"${ELASTIC_PASSWORD}\"}"
echo "✅ kibana_system password set"

# Import dashboards in background (waits for Kibana to be ready internally)
/usr/local/bin/setup-dashboards.sh &

echo "Starting Kibana..."

# Configure Kibana HTTPS using generated certificates
export SERVER_SSL_ENABLED=true
export SERVER_SSL_CERTIFICATE=/etc/ssl/certs/server.crt
export SERVER_SSL_KEY=/etc/ssl/private/server.key

# Configure Kibana connection to secure Elasticsearch
export ELASTICSEARCH_USERNAME=kibana_system
export ELASTICSEARCH_PASSWORD="$ELASTIC_PASSWORD"
export ELASTICSEARCH_SSL_VERIFICATIONMODE=full
export ELASTICSEARCH_SSL_CERTIFICATEAUTHORITIES=/run/secrets/ca_cert

# Drop to kibana user and start (preserving env variables)
exec runuser -p -u kibana -- /usr/local/bin/kibana-docker "$@"
