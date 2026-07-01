#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh elasticsearch "elasticsearch,localhost,127.0.0.1"

# Make certs readable by elasticsearch user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true

# Ensure data directory has correct ownership
chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/data

echo "Starting Elasticsearch..."

# Drop to elasticsearch user and start
exec su -s /bin/bash elasticsearch -c '/usr/local/bin/docker-entrypoint.sh eswrapper'
