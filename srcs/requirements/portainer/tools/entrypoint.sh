#!/bin/sh
set -e

# === TLS Certificate Generation ===
/usr/local/bin/generate_cert.sh portainer "portainer,localhost,127.0.0.1"

if [ -f /run/secrets/portainer_credenciais ]; then
    PORTAINER_PASSWORD=$(sed -n '2p' /run/secrets/portainer_credenciais | cut -d'=' -f2 | tr -d '\r')
    
    echo -n "$PORTAINER_PASSWORD" > /tmp/portainer_password
    
    exec /portainer \
        --sslcert /etc/ssl/certs/server.crt \
        --sslkey /etc/ssl/private/server.key \
        --admin-password-file=/tmp/portainer_password
else
    exec /portainer \
        --sslcert /etc/ssl/certs/server.crt \
        --sslkey /etc/ssl/private/server.key
fi
