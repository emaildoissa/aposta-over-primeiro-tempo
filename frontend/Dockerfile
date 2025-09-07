# Estágio 1: Build - Usa uma imagem Node.js para construir os arquivos do React
FROM node:18-alpine AS builder

WORKDIR /app

# --- USA NPM ---
# Copia o package.json E o package-lock.json (essencial para npm)
COPY package.json package-lock.json ./

# --- USA NPM ---
# Instala as dependências com npm
# A flag --legacy-peer-deps é uma boa prática para evitar erros com versões de dependências
RUN npm install --legacy-peer-deps

# Copia o resto do código-fonte
COPY . .

# --- USA NPM ---
# Constrói a aplicação com o script de build do npm
RUN npm run build

# Estágio 2: Produção - Usa uma imagem Nginx para servir os arquivos estáticos
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx para lidar com as rotas do React
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80