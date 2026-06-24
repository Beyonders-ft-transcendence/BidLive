FROM alpine:3.22

ENV LIVEKIT_VERSION=1.11.0

RUN apk add --no-cache \
    ca-certificates \
    curl \
    tar

# Copy cfssl binaries from official image
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

# Copy shared certificate generation script
COPY ./generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

RUN curl -sSL -o /tmp/livekit.tar.gz \
    "https://github.com/livekit/livekit/releases/download/v${LIVEKIT_VERSION}/livekit_${LIVEKIT_VERSION}_linux_amd64.tar.gz" && \
    tar -xzf /tmp/livekit.tar.gz -C /usr/local/bin/ livekit-server && \
    rm /tmp/livekit.tar.gz && \
    apk del curl tar

# CORRIGIDO: Comando unificado na mesma linha para evitar falha no build
RUN id -u livekit >/dev/null 2>&1 || adduser -D livekit

RUN mkdir -p /etc/livekit && \
    chown -R livekit:livekit /etc/livekit

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7880 7881 6789 5000-5100/udp

# Entrypoint runs as root to generate certs, then drops to livekit user
ENTRYPOINT ["/entrypoint.sh"]
