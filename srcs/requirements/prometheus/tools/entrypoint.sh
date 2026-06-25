#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh prometheus "prometheus,localhost,127.0.0.1"

echo "Starting Prometheus..."

cat > /etc/prometheus/web-config.yml <<EOF
tls_server_config:
  cert_file: /etc/ssl/certs/server.crt
  key_file: /etc/ssl/private/server.key
EOF

exec prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.listen-address="0.0.0.0:9090" \
  --web.config.file=/etc/prometheus/web-config.yml