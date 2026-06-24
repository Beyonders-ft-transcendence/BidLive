#!/bin/sh
set -e

if [ -f /run/secrets/redis_credenciais ]; then
    REDIS_PASSWORD=$(sed -n '1p' /run/secrets/redis_credenciais | cut -d'=' -f2 | tr -d '\r')

    sed -i "s/REDIS_USER_PLACEHOLDER/$REDIS_USER/g" /etc/redis/redis.conf
    sed -i "s/REDIS_PASSWORD_PLACEHOLDER/$REDIS_PASSWORD/g" /etc/redis/redis.conf
    sed -i "s/REDIS_PORT_PLACEHOLDER/$REDIS_PORT/g" /etc/redis/redis.conf
fi  

exec redis-server /etc/redis/redis.conf