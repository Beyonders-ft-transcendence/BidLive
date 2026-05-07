FROM alpine:3.22

RUN apk add --no-cache \
    su-exec \
    postgresql16 \
    postgresql16-client \
    postgresql16-contrib

RUN id -u postgres >/dev/null 2>&1 || adduser -D postgres

RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql

RUN mkdir -p /run/postgresql && \
    chown -R postgres:postgres /run/postgresql

ENV PGDATA=/var/lib/postgresql/data

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER postgres

EXPOSE 5432

ENTRYPOINT ["/entrypoint.sh"]