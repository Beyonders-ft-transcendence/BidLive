FROM nginx/nginx-prometheus-exporter:1.1.0 AS binary-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates

# Copy the binary from the official image
COPY --from=binary-source /usr/bin/nginx-prometheus-exporter /usr/bin/nginx-prometheus-exporter

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

# Copy entrypoint and set permissions
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9113

ENTRYPOINT ["/entrypoint.sh"]
