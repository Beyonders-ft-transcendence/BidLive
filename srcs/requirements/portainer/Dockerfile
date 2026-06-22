FROM portainer/portainer-ce:2.39.3-alpine AS portainer-source

FROM alpine:3.22

RUN apk add --no-cache ca-certificates libc6-compat curl

COPY --from=portainer-source /portainer /portainer
COPY --from=portainer-source /public /public

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000 9443

ENTRYPOINT ["/entrypoint.sh"]