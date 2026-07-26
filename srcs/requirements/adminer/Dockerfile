FROM alpine:3.22

RUN apk add --no-cache \
    php83 \
    php83-session \
    php83-mysqli \
    php83-pgsql \
    php83-sqlite3 \
    curl \
    ca-certificates \
    stunnel

# Install cfssl natively from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

WORKDIR /var/www/adminer

RUN curl -L --insecure https://www.adminer.org/latest.php -o index.php

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
