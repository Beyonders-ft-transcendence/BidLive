#!/bin/sh
set -e

echo "Starting Prometheus..."

exec prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.listen-address="0.0.0.0:9090"