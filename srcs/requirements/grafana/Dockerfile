FROM grafana/grafana-oss:12.0.0

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
COPY --chown=472:472 ./conf/datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
USER grafana

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
