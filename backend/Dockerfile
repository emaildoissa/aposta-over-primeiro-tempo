# Estágio 1: Build - Usa uma imagem Go completa para compilar a aplicação
FROM golang:1.23-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os ficheiros de dependências primeiro para aproveitar o cache do Docker
COPY go.mod go.sum ./
# Baixa as dependências
RUN go mod download

# Copia todo o resto do código-fonte do backend
COPY . .

# Compila a aplicação. As flags criam um executável estático e otimizado para Linux.
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# ---

# Estágio 2: Produção - Começa com uma imagem "vazia" (alpine), que é extremamente leve
FROM alpine:latest  

# Define o diretório de trabalho
WORKDIR /root/

# Copia apenas o ficheiro executável compilado do estágio de build anterior
COPY --from=builder /app/main .

# Expõe a porta que a nossa aplicação Go usa
EXPOSE 8080

# Comando para executar a aplicação quando o contêiner iniciar
CMD ["./main"]