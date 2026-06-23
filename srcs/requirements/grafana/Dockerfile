FROM grafana/grafana-oss:12.0.0

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --chown=472:472 ./conf/datasources/datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY --chown=472:472 ./conf/dashboards/dashboards.yml /etc/grafana/provisioning/dashboards/dashboards.yml
COPY --chown=472:472 ./conf/dashboards/*.json /var/lib/grafana/dashboards/

USER grafana

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
