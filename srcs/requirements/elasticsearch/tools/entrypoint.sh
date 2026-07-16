#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh elasticsearch "elasticsearch,localhost,127.0.0.1"

# Make certs readable by elasticsearch user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true
chmod 755 /etc/ssl/private 2>/dev/null || true

# Copy certificates and CA to config/certs (Elasticsearch Java Security Manager requirement)
mkdir -p /usr/share/elasticsearch/config/certs
cp /etc/ssl/certs/server.crt /usr/share/elasticsearch/config/certs/server.crt
cp /etc/ssl/private/server.key /usr/share/elasticsearch/config/certs/server.key
if [ -f /run/secrets/ca_cert ]; then
    cp /run/secrets/ca_cert /usr/share/elasticsearch/config/certs/ca.crt
fi
chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/config/certs
chmod 600 /usr/share/elasticsearch/config/certs/server.key
chmod 644 /usr/share/elasticsearch/config/certs/server.crt /usr/share/elasticsearch/config/certs/ca.crt

# Ensure data directory has correct ownership
chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/data

# Load Elasticsearch credentials from Secret (line 1 = user, line 2 = password)
if [ -f /run/secrets/elasticsearch_credenciais ]; then
    export ELASTIC_USER=$(sed -n '1p' /run/secrets/elasticsearch_credenciais | tr -d '\r')
    export ELASTIC_PASSWORD=$(sed -n '2p' /run/secrets/elasticsearch_credenciais | tr -d '\r')
fi

echo "Starting Elasticsearch..."

# Drop to elasticsearch user and start, ensuring PATH and ELASTIC_PASSWORD are correctly defined
exec su -s /bin/bash elasticsearch -c "export PATH=/usr/share/elasticsearch/bin:\$PATH; export ELASTIC_PASSWORD='$ELASTIC_PASSWORD'; exec /usr/local/bin/docker-entrypoint.sh eswrapper"
