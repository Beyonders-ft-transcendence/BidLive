FROM oliver006/redis_exporter:v1.62.0-alpine

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nobody
EXPOSE 9121

ENTRYPOINT ["/entrypoint.sh"]
