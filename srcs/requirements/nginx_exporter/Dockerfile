FROM nginx/nginx-prometheus-exporter:1.1.0

USER root
COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9113

ENTRYPOINT ["/entrypoint.sh"]
