#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh frontend "frontend,localhost,127.0.0.1"

# Make certs readable by appuser
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true

# === Inject GOOGLE_CLIENT_ID from Docker secret at runtime ===
# VITE_* vars are baked into the bundle at build time via Docker build args.
# GOOGLE_CLIENT_ID comes from a Docker secret (runtime-only), so we inject it
# into index.html before serving.
if [ -f /run/secrets/google_credenciais ]; then
    VITE_GOOGLE_CLIENT_ID=$(sed -n '1p' /run/secrets/google_credenciais | cut -d'=' -f2 | tr -d '\r')
    if [ -n "$VITE_GOOGLE_CLIENT_ID" ] && [ -f /app/dist/index.html ]; then
        sed -i "s|</head>|<script>window.__VITE_GOOGLE_CLIENT_ID__=\"${VITE_GOOGLE_CLIENT_ID}\"</script></head>|g" /app/dist/index.html
    fi
fi

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