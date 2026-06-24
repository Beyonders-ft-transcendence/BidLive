FROM alpine:3.22 AS builder

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm prune --omit=dev

FROM alpine:3.22

RUN apk add --no-cache nodejs npm ca-certificates

# Copy cfssl binaries from official image
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssl /usr/bin/cfssl
COPY --from=cfssl/cfssl:1.6.1 /usr/bin/cfssljson /usr/bin/cfssljson

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh  /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]