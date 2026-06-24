FROM oliver006/redis_exporter:v1.62.0-alpine

USER root

RUN apk add --no-cache ca-certificates

# Copy cfssl binaries from official image
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9121

ENTRYPOINT ["/entrypoint.sh"]
