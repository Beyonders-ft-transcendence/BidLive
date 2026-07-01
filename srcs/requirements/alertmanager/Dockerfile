FROM alpine:3.22

RUN apk add --no-cache \
    alertmanager \
    ca-certificates \
    gettext

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

WORKDIR /etc/alertmanager

COPY conf/alertmanager.yml.template /etc/alertmanager/alertmanager.yml.template
COPY ./tools/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 9093

ENTRYPOINT ["/entrypoint.sh"]
