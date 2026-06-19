#!/bin/sh
set -e

LIVEKIT_API_KEY="${LIVEKIT_API_KEY:-devkey}"
LIVEKIT_API_SECRET="${LIVEKIT_API_SECRET:-secret}"
LIVEKIT_HTTP_PORT="${LIVEKIT_HTTP_PORT:-7880}"
LIVEKIT_TCP_PORT="${LIVEKIT_TCP_PORT:-7881}"
LIVEKIT_RTC_UDP_PORT_RANGE_START="${LIVEKIT_RTC_UDP_PORT_RANGE_START:-5000}"
LIVEKIT_RTC_UDP_PORT_RANGE_END="${LIVEKIT_RTC_UDP_PORT_RANGE_END:-5100}"
REDIS_URL="${REDIS_URL:-}"

CONFIG_FILE="/etc/livekit/livekit.yaml"

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

if [ -n "$REDIS_URL" ]; then
  cat >> "$CONFIG_FILE" <<EOF
redis:
  address: ${REDIS_URL}
EOF
fi

echo "Starting LiveKit Server..."
exec livekit-server --config "$CONFIG_FILE" --bind 0.0.0.0
