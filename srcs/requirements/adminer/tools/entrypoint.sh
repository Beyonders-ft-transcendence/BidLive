#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh adminer "adminer,localhost,127.0.0.1"

# === Configure stunnel ===
echo "Configuring stunnel..."
cat > /tmp/stunnel.conf <<EOF
pid = /tmp/stunnel.pid
foreground = no
client = no

[adminer]
accept = 0.0.0.0:8080
connect = 127.0.0.1:8081
cert = /etc/ssl/certs/server.crt
key = /etc/ssl/private/server.key
EOF

stunnel /tmp/stunnel.conf

echo "Starting Adminer on port 8081 (proxied via stunnel on port 8080)..."
exec php83 -S 127.0.0.1:8081 -t /var/www/adminer
