#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh frontend "frontend,localhost,127.0.0.1"

# Make certs readable by appuser
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true

# === Export Vite build-time environment variables ===

# Extract GOOGLE_CLIENT_ID from Docker secret and export as VITE_GOOGLE_CLIENT_ID
if [ -f /run/secrets/google_credenciais ]; then
    VITE_GOOGLE_CLIENT_ID=$(sed -n '1p' /run/secrets/google_credenciais | cut -d'=' -f2 | tr -d '\r')
    export VITE_GOOGLE_CLIENT_ID
fi

#####
# === Create .env file with Vite variables ===
cat <<EOF > /app/.env
VITE_API_URL=${VITE_API_URL}
VITE_API_BASE_URL=${VITE_API_BASE_URL}
VITE_WS_BASE_URL=${VITE_WS_BASE_URL}
VITE_LIVEKIT_URL=${VITE_LIVEKIT_URL}
VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
EOF

# Standardize permissions for appuser access
chown appuser:appuser /app/.env 2>/dev/null || true
#####

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

# === Drop privileges and start static file server ===
echo "Starting static file server on port 3001 (proxied via stunnel on port 3000)..."
exec su -s /bin/sh appuser -c "
set -e

cd /app

# Start serve for static files
exec npx serve -s dist -l 3001
"