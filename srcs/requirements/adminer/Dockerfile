FROM alpine:3.22

RUN apk add --no-cache \
    php83 \
    php83-session \
    php83-mysqli \
    php83-pgsql \
    php83-sqlite3 \
    curl

WORKDIR /var/www/adminer

RUN curl -L --insecure https://www.adminer.org/latest.php -o index.php

EXPOSE 8080

CMD ["php83", "-S", "0.0.0.0:8080", "-t", "/var/www/adminer"]
