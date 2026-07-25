# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS build

ARG VITE_API_URL
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_LIVEKIT_URL
ARG VITE_GOOGLE_CLIENT_ID

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM alpine:3.22

RUN apk add --no-cache nodejs npm ca-certificates stunnel

# Install cfssl from Alpine edge testing repository
RUN apk add --no-cache cfssl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

# Copy shared certificate generation script
COPY ./tools/generate_cert.sh /usr/local/bin/generate_cert.sh
RUN chmod +x /usr/local/bin/generate_cert.sh

RUN id -u appuser >/dev/null 2>&1 || adduser -D appuser

RUN mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy built assets from build stage
COPY --from=build --chown=appuser:appuser /app/dist ./dist

COPY ./tools/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
