#!/bin/sh
set -e

/usr/local/bin/generate_cert.sh nginx-exporter "nginx-exporter,localhost,127.0.0.1"

NGINX_EXPORTER_SCRAPE_URI="${NGINX_EXPORTER_SCRAPE_URI:-http://nginx:8080/nginx_status}"

exec /usr/bin/nginx-prometheus-exporter -nginx.scrape-uri="$NGINX_EXPORTER_SCRAPE_URI" "$@"
