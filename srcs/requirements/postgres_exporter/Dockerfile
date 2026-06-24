FROM prometheuscommunity/postgres-exporter:v0.17.1 AS binary-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates

COPY --from=binary-source /bin/postgres_exporter /usr/bin/postgres_exporter

COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9187

ENTRYPOINT ["/entrypoint.sh"]
