FROM portainer/portainer-ce:2.39.3-alpine AS portainer-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates libc6-compat curl

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY --from=portainer-source /portainer /portainer
COPY --from=portainer-source /public /public

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000 9443

ENTRYPOINT ["/entrypoint.sh"]