#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh logstash "logstash,localhost,127.0.0.1"

# Make certs readable by logstash user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true
chmod 755 /etc/ssl/private 2>/dev/null || true

# Ensure data directory has correct ownership
chown -R logstash:logstash /usr/share/logstash/data

# Load Elasticsearch credentials from Secret (line 1 = user, line 2 = password)
if [ -f /run/secrets/elasticsearch_credenciais ]; then
    export ELASTIC_PASSWORD=$(sed -n '2p' /run/secrets/elasticsearch_credenciais | tr -d '\r')
fi

echo "Waiting for Elasticsearch to be ready..."
until curl -sk -u "elastic:${ELASTIC_PASSWORD}" https://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    echo "  Elasticsearch not ready yet, retrying in 5s..."
    sleep 5
done
echo "✅ Elasticsearch is ready."

# Setup ILM policy in Elasticsearch
/usr/local/bin/setup-ilm.sh

echo "Starting Logstash..."

# Drop to logstash user and start (preserving environment variables)
exec runuser -p -u logstash -- /usr/local/bin/docker-entrypoint "$@"
