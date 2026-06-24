#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh frontend "frontend,localhost,127.0.0.1"

export SSL_CERT_FILE=/etc/ssl/certs/ca.crt
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca.crt

echo "Starting Next.js application..."
exec npm run start
