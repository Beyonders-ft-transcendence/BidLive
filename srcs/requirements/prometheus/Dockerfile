FROM alpine:3.22

RUN apk add --no-cache \
    prometheus

WORKDIR /etc/prometheus

COPY conf/prometheus.yml /etc/prometheus/prometheus.yml
COPY ./tools/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 9090

ENTRYPOINT ["/entrypoint.sh"]