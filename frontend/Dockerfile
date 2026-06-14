# --- Stage 1: Base/Development ---
FROM node:22-alpine AS development

# Configura o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência primeiro (para melhor uso de cache do Docker)
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm ci

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que o Vite usa
EXPOSE 3000

# Comando padrão para ambiente de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# --- Stage 2: Build ---
FROM development AS builder
RUN npm run build

# --- Stage 3: Produção ---
FROM nginx:alpine AS production

# Remove a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia o build finalizado (dist) do stage builder para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Cria uma configuração simples do Nginx para suportar roteamento SPA (React Router/Vite)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
