#!/bin/sh
set -e

/usr/local/bin/generate_cert.sh nginx-exporter "nginx-exporter,localhost,127.0.0.1"

NGINX_EXPORTER_SCRAPE_URI="${NGINX_EXPORTER_SCRAPE_URI:-https://nginx:8080/nginx_status}"

cat > /etc/ssl/certs/web-config.yml <<EOF
tls_server_config:
  cert_file: /etc/ssl/certs/server.crt
  key_file: /etc/ssl/private/server.key
EOF

exec /usr/bin/nginx-prometheus-exporter \
  --nginx.scrape-uri="$NGINX_EXPORTER_SCRAPE_URI" \
  --no-nginx.ssl-verify \
  --web.config.file=/etc/ssl/certs/web-config.yml \
  "$@"
