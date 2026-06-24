#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh adminer "adminer,localhost,127.0.0.1"

echo "Starting Adminer..."
exec php83 -S 0.0.0.0:8080 -t /var/www/adminer
