FROM prometheuscommunity/postgres-exporter:v0.17.1

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nobody
EXPOSE 9187

ENTRYPOINT ["/entrypoint.sh"]
