FROM grafana/grafana-oss:12.0.0

USER root

# Install cfssl (grafana image is Alpine-based)
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

# Copy shared certificate generation script
COPY ./generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --chown=472:472 ./conf/datasources/datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY --chown=472:472 ./conf/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY --chown=472:472 ./conf/dashboards/*.json /var/lib/grafana/dashboards/

EXPOSE 3001

# Entrypoint runs as root to generate certs, then drops to grafana
ENTRYPOINT ["/entrypoint.sh"]
