FROM alpine:3.22

RUN apk add --no-cache redis

COPY conf/redis.conf /etc/redis/redis.conf

COPY ./tools/entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 6379

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
