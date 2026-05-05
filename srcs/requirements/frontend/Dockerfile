# ===== BUILD STAGE =====
FROM alpine:3.22 AS builder

# instalar node + npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# copiar dependencias
COPY package*.json ./
RUN npm install

# copiar codigo
COPY . .

# build Next.js
RUN npm run build

# manter apenas deps de producao
RUN npm prune --omit=dev


# ===== RUNTIME STAGE =====
FROM alpine:3.22

# instalar node + npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

ENV NODE_ENV=production

# copiar build e dependencias
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]