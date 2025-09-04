# Estágio 1: Build - Usa uma imagem Node.js para construir os arquivos do React
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências e as instala
COPY package.json yarn.lock ./
RUN yarn install

# Copia todo o código-fonte
COPY . .

# Constrói a aplicação para produção
RUN yarn build

# Estágio 2: Produção - Usa uma imagem Nginx para servir os arquivos estáticos
FROM nginx:stable-alpine

# Copia os arquivos construídos do estágio anterior para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# O Nginx já inicia automaticamente, não precisamos de um CMD