FROM grafana/grafana-oss:12.0.0

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER grafana

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
