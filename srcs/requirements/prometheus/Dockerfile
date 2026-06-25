FROM alpine:3.22

RUN apk add --no-cache \
    prometheus \
    ca-certificates

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

WORKDIR /etc/prometheus

COPY conf/prometheus.yml /etc/prometheus/prometheus.yml
COPY ./tools/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 9090

ENTRYPOINT ["/entrypoint.sh"]