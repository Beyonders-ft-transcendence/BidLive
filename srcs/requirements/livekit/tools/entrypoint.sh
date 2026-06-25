#!/bin/sh
set -e

# === TLS Certificate Generation (runs as root) ===
/usr/local/bin/generate_cert.sh livekit "livekit,localhost,127.0.0.1"

# Make certs readable by livekit user
chmod 644 /etc/ssl/certs/server.crt 2>/dev/null || true
chmod 644 /etc/ssl/private/server.key 2>/dev/null || true

# === Drop privileges and continue as livekit user ===
exec su -s /bin/sh livekit -c '
set -e

if [ -f /run/secrets/livekit_credenciais ] && [ -f /run/secrets/redis_credenciais ]; then
    REDIS_PASSWORD=$(sed -n "1p" /run/secrets/redis_credenciais | cut -d"=" -f2 | tr -d "\r")

    LIVEKIT_API_KEY=$(sed -n "1p" /run/secrets/livekit_credenciais | cut -d"=" -f2 | tr -d "\r")
    LIVEKIT_API_SECRET=$(sed -n "2p" /run/secrets/livekit_credenciais | cut -d"=" -f2 | tr -d "\r")
    export LIVEKIT_API_KEY LIVEKIT_API_SECRET   

    REDIS_ADDRESS="${REDIS_HOST:-redis}:${REDIS_PORT}"
else
  echo "No credentials found"
  exit 1
fi  

# === Configure stunnel ===
echo "Configuring stunnel..."
cat > /tmp/stunnel.conf <<EOF
pid = /tmp/stunnel.pid
foreground = no
client = no

[livekit-api]
accept = 0.0.0.0:7880
connect = 127.0.0.1:8080
cert = /etc/ssl/certs/server.crt
key = /etc/ssl/private/server.key

[livekit-metrics]
accept = 0.0.0.0:6789
connect = 127.0.0.1:6788
cert = /etc/ssl/certs/server.crt
key = /etc/ssl/private/server.key
EOF

stunnel /tmp/stunnel.conf

CONFIG_FILE="/tmp/livekit.yaml"
LIVEKIT_REGION="${LIVEKIT_REGION:-local}"

echo "Generating LiveKit configuration..."

cat > "$CONFIG_FILE" <<INNEREOF
port: 8080
prometheus_port: 6788
region: ${LIVEKIT_REGION}
rtc:
  tcp_port: ${LIVEKIT_TCP_PORT}
  port_range_start: ${LIVEKIT_RTC_UDP_PORT_RANGE_START}
  port_range_end: ${LIVEKIT_RTC_UDP_PORT_RANGE_END}
  use_external_ip: false
keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
logging:
  level: info
INNEREOF

if [ -n "$REDIS_ADDRESS" ]; then
  cat >> "$CONFIG_FILE" <<INNEREOF
redis:
  address: ${REDIS_ADDRESS}
  username: ${REDIS_USER}
  password: ${REDIS_PASSWORD}
  db: 0
  read_timeout: 2
  write_timeout: 2
INNEREOF
fi

echo "Starting LiveKit Server..."

unset REDIS_HOST
unset REDIS_PORT
unset REDIS_PASSWORD
unset REDIS_USER

exec livekit-server --config "$CONFIG_FILE" --bind 0.0.0.0
'
