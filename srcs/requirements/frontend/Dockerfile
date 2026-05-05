# ===== BUILD STAGE =====
FROM alpine:3.22 AS builder

# instalar node + npm
RUN apk add --no-cache nodejs npm

WORKDIR /app

# copiar dependências
COPY package*.json ./
RUN npm install

# copiar código
COPY . .

# build (React/Vite/etc)
RUN npm run build


# ===== RUNTIME STAGE =====
FROM alpine:3.22

# instalar node leve + serve
RUN apk add --no-cache nodejs npm

WORKDIR /app

# instalar servidor estático leve
RUN npm install -g serve

# copiar build final
COPY --from=builder /app/dist /app/dist

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["serve", "-s", "/app/dist", "-l", "80"]