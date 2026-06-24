#!/bin/sh
set -e

NGINX_EXPORTER_SCRAPE_URI="${NGINX_EXPORTER_SCRAPE_URI:-http://nginx:8080/nginx_status}"

exec /usr/bin/nginx-prometheus-exporter -nginx.scrape-uri="$NGINX_EXPORTER_SCRAPE_URI" "$@"
