FROM danihodovic/celery-exporter:0.12.2

USER root

# Install cfssl/cfssljson and other required tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && curl -s -L -o /usr/local/bin/cfssl https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssl_1.6.4_linux_amd64 \
    && curl -s -L -o /usr/local/bin/cfssljson https://github.com/cloudflare/cfssl/releases/download/v1.6.4/cfssljson_1.6.4_linux_amd64 \
    && chmod +x /usr/local/bin/cfssl /usr/local/bin/cfssljson \
    && rm -rf /var/lib/apt/lists/*

COPY ./tools/generate_cert.sh /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./tools/tls_proxy.py /tls_proxy.py

EXPOSE 9808

ENTRYPOINT ["/entrypoint.sh"]
