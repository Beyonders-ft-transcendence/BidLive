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

# Export .env.frontend variables if available
if [ -f /run/secrets/env_frontend ]; then
    while IFS= read -r line; do
        case "$line" in
            \#*|"") continue ;;
            *=*) export "$line" ;;
        esac
    done < /run/secrets/env_frontend
fi

# === Drop privileges and start server ===
exec su -s /bin/sh appuser -c "
set -e

cd /app

# Start Caddy with HTTPS
exec caddy run --config /etc/caddy/Caddyfile
"
