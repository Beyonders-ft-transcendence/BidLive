#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh kibana "kibana,localhost,127.0.0.1"

# Make certs readable by kibana user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true
chmod 755 /etc/ssl/private 2>/dev/null || true

echo "Waiting for Elasticsearch to be ready..."
until curl -s http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    echo "  Elasticsearch not ready yet, retrying in 5s..."
    sleep 5
done
echo "✅ Elasticsearch is ready."

echo "Starting Kibana..."

# Configure Kibana HTTPS using generated certificates
export SERVER_SSL_ENABLED=true
export SERVER_SSL_CERTIFICATE=/etc/ssl/certs/server.crt
export SERVER_SSL_KEY=/etc/ssl/private/server.key

# Drop to kibana user and start
exec runuser -u kibana -- /usr/local/bin/kibana-docker "$@"

