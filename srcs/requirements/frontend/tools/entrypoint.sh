#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh frontend "frontend,localhost,127.0.0.1"

export SSL_CERT_FILE=/etc/ssl/certs/ca.crt
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca.crt

# === Configure stunnel ===
echo "Configuring stunnel..."
cat > /tmp/stunnel.conf <<EOF
pid = /tmp/stunnel.pid
foreground = no
client = no

[frontend]
accept = 0.0.0.0:3000
connect = 127.0.0.1:3001
cert = /etc/ssl/certs/server.crt
key = /etc/ssl/private/server.key
EOF

stunnel /tmp/stunnel.conf

echo "Starting Next.js application on port 3001 (proxied via stunnel on port 3000)..."
exec npm run start -- -p 3001
