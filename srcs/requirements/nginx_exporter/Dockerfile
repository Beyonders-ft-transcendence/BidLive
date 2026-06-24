FROM nginx/nginx-prometheus-exporter:1.1.0 AS binary-source

FROM alpine:3.22

# Copy the binary from the official image
COPY --from=binary-source /usr/bin/nginx-prometheus-exporter /usr/bin/nginx-prometheus-exporter

# Copy entrypoint and set permissions
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9113

ENTRYPOINT ["/entrypoint.sh"]
