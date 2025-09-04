# Estágio 1: Build - Usa uma imagem Go completa para compilar a aplicação
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências e as baixa
COPY go.mod go.sum ./
RUN go mod download

# Copia todo o código-fonte
COPY . .

# Compila a aplicação de forma estática
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Estágio 2: Produção - Usa uma imagem mínima e copia apenas o executável
FROM alpine:latest  

WORKDIR /root/

# Copia o binário compilado do estágio de build
COPY --from=builder /app/main .

# Expõe a porta que a nossa aplicação Go usa
EXPOSE 8080

# Comando para rodar a aplicação quando o container iniciar
CMD ["./main"]