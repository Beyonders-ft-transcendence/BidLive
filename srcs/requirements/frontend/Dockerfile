# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM alpine:3.22

RUN apk add --no-cache caddy ca-certificates

# Install cfssl from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

RUN id -u appuser >/dev/null 2>&1 || adduser -D appuser

RUN mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy Caddyfile config
COPY --chown=appuser:appuser ./conf/Caddyfile /etc/caddy/Caddyfile

# Copy built assets from build stage
COPY --from=build --chown=appuser:appuser /app/dist ./dist

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
