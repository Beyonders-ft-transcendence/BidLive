FROM portainer/portainer-ce:2.39.3-alpine AS portainer-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates libc6-compat curl

# Copy cfssl binaries from official image
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

# Copy shared certificate generation script
COPY ./generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY --from=portainer-source /portainer /portainer
COPY --from=portainer-source /public /public

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000 9443

ENTRYPOINT ["/entrypoint.sh"]