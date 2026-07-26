#!/bin/sh
set -e

/usr/local/bin/generate_cert.sh nginx "bidlive.42.fr,nginx,localhost,127.0.0.1"

echo "Starting Nginx..."
exec nginx -g "daemon off;"
