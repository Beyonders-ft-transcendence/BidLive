#!/bin/sh
set -e

if [ -f /run/secrets/portainer_credenciais ]; then
    PORTAINER_PASSWORD=$(sed -n '2p' /run/secrets/portainer_credenciais | cut -d'=' -f2 | tr -d '\r')
    
    echo -n "$PORTAINER_PASSWORD" > /tmp/portainer_password
    
    exec /portainer --admin-password-file=/tmp/portainer_password
else
    exec /portainer
fi
