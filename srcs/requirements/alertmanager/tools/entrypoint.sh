#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh alertmanager "alertmanager,localhost,127.0.0.1"

# === Load Secrets ===
if [ -f /run/secrets/email_credenciais ]; then
  export SMTP_AUTH_USERNAME=$(sed -n '1p' /run/secrets/email_credenciais | cut -d'=' -f2 | tr -d '\r')
  export SMTP_AUTH_PASSWORD=$(sed -n '2p' /run/secrets/email_credenciais | cut -d'=' -f2 | tr -d '\r')
  export SMTP_FROM=${SMTP_AUTH_USERNAME}
fi

if [ -f /run/secrets/webhook_credenciais ]; then
  export DISCORD_WEBHOOK_URL=$(cat /run/secrets/webhook_credenciais | cut -d'=' -f2- | tr -d '\r')
fi

# === Generate Final Config from Template ===
envsubst < /etc/alertmanager/alertmanager.yml.template > /etc/alertmanager/alertmanager.yml

echo "Starting Alertmanager..."

cat > /etc/alertmanager/web-config.yml <<EOF
tls_server_config:
  cert_file: /etc/ssl/certs/server.crt
  key_file: /etc/ssl/private/server.key
EOF

# === Enviar Alerta Base de Startup (quando o container sobe) ===
(
  sleep 15
  amtool alert add AlertmanagerStarted \
    service=alertmanager \
    severity=info \
    instance=alertmanager \
    --annotation="summary=\"Alertmanager iniciado com sucesso\"" \
    --annotation="description=\"O container do Alertmanager subiu e está operacional para gestão de alertas.\"" \
    --alertmanager.url=https://localhost:9093 \
    --http.config.file=/dev/null 2>/dev/null || true
) &

exec alertmanager \
  --config.file=/etc/alertmanager/alertmanager.yml \
  --storage.path=/alertmanager \
  --web.listen-address="0.0.0.0:9093" \
  --web.config.file=/etc/alertmanager/web-config.yml
