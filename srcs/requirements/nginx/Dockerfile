FROM alpine:3.22

RUN apk add --no-cache nginx openssl ca-certificates

COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

COPY ./conf/nginx.conf /etc/nginx/nginx.conf

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
