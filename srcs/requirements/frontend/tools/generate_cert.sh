#!/bin/sh
set -e

SERVICE_NAME=$1
HOSTS=$2

CA_CERT="/run/secrets/ca_cert"
CA_KEY="/run/secrets/ca_key"
CA_CONFIG="/run/secrets/ca_config"

if [ ! -f "$CA_CERT" ] || [ ! -f "$CA_KEY" ]; then
    echo "⚠️ CA Root Secrets not found at /run/secrets. Skipping HTTPS cert generation."
    exit 0
fi

echo "🔑 Generating internal TLS certificate for ${SERVICE_NAME} (hosts: ${HOSTS})..."

# Create local directories
mkdir -p /etc/ssl/certs /etc/ssl/private

# Generate temporary CSR config
CSR_FILE="/tmp/${SERVICE_NAME}-csr.json"
cat > "${CSR_FILE}" <<EOF
{
  "CN": "${SERVICE_NAME}",
  "hosts": [$(echo "${HOSTS}" | sed 's/[^, ]*/"\&"/g')],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "AO",
      "ST": "Luanda",
      "L": "Luanda",
      "O": "BidLive",
      "OU": "${SERVICE_NAME}"
    }
  ]
}
EOF

# Generate certificate using the mounted secrets
cfssl gencert \
    -ca="${CA_CERT}" \
    -ca-key="${CA_KEY}" \
    -config="${CA_CONFIG}" \
    -profile=default \
    -hostname="${HOSTS}" \
    "${CSR_FILE}" | cfssljson -bare "/tmp/${SERVICE_NAME}"

# Move to final paths in the container
mv "/tmp/${SERVICE_NAME}.pem" /etc/ssl/certs/server.crt
mv "/tmp/${SERVICE_NAME}-key.pem" /etc/ssl/private/server.key
rm -f "${CSR_FILE}" "/tmp/${SERVICE_NAME}.csr"

# Add root CA to the local trust store for outgoing calls
if [ -d /usr/local/share/ca-certificates ]; then
    cp "${CA_CERT}" /usr/local/share/ca-certificates/ca.crt
    update-ca-certificates 2>/dev/null || true
elif [ -d /etc/ssl/certs ]; then
    cp "${CA_CERT}" /etc/ssl/certs/ca.crt
fi

echo "✅ TLS Certificate generated successfully for ${SERVICE_NAME}"
