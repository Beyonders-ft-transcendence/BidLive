#!/bin/sh
set -e

if [ -f /run/secrets/livekit_credenciais ] && [ -f /run/secrets/redis_credenciais ]; then
    REDIS_PASSWORD=$(sed -n '1p' /run/secrets/redis_credenciais | cut -d'=' -f2 | tr -d '\r')

    LIVEKIT_API_KEY=$(sed -n '1p' /run/secrets/livekit_credenciais | cut -d'=' -f2 | tr -d '\r')
    LIVEKIT_API_SECRET=$(sed -n '2p' /run/secrets/livekit_credenciais | cut -d'=' -f2 | tr -d '\r')
    export LIVEKIT_API_KEY LIVEKIT_API_SECRET

    REDIS_ADDRESS="redis:${REDIS_PORT}"
else
  echo "No credentials found"
  exit 1
fi  

CONFIG_FILE="/tmp/livekit.yaml"

echo "Generating LiveKit configuration..."

cat > "$CONFIG_FILE" <<EOF
port: ${LIVEKIT_HTTP_PORT}
rtc:
  tcp_port: ${LIVEKIT_TCP_PORT}
  port_range_start: ${LIVEKIT_RTC_UDP_PORT_RANGE_START}
  port_range_end: ${LIVEKIT_RTC_UDP_PORT_RANGE_END}
  use_external_ip: false
keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
logging:
  level: info
EOF

if [ -n "$REDIS_ADDRESS" ]; then
  cat >> "$CONFIG_FILE" <<EOF
redis:
  address: ${REDIS_ADDRESS}
  username: ${REDIS_USER}
  password: ${REDIS_PASSWORD}
  db: 0
  read_timeout: 5
  write_timeout: 5
EOF
fi

echo "Starting LiveKit Server..."
exec livekit-server --config "$CONFIG_FILE" --bind 0.0.0.0