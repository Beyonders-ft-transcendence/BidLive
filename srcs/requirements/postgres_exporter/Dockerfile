FROM prometheuscommunity/postgres-exporter:v0.17.1 AS binary-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates

COPY --from=binary-source /bin/postgres_exporter /usr/bin/postgres_exporter

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9187

ENTRYPOINT ["/entrypoint.sh"]
