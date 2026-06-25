FROM grafana/grafana-oss:12.0.0

USER root

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --chown=472:472 ./conf/datasources/datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY --chown=472:472 ./conf/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY --chown=472:472 ./conf/dashboards/*.json /var/lib/grafana/dashboards/

EXPOSE 3001

# Entrypoint runs as root to generate certs, then drops to grafana
ENTRYPOINT ["/entrypoint.sh"]
