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

# Instala o 'netcat', uma ferramenta necessária para o nosso script de verificação da base de dados.
# '--no-cache' garante que não guardamos o índice de pacotes, mantendo a imagem pequena.
RUN apk add --no-cache netcat-openbsd

# Define o diretório de trabalho
WORKDIR /root/

# Copia apenas o ficheiro executável compilado do estágio de build anterior
COPY --from=builder /app/main .

# Copia o nosso novo script de entrada para dentro do contêiner
COPY entrypoint.sh .

# Dá permissão de execução ao script
RUN chmod +x entrypoint.sh

# Expõe a porta que a nossa aplicação Go usa
EXPOSE 8080

# Define o script de entrada como o ponto de partida do contêiner
ENTRYPOINT ["./entrypoint.sh"]

# Comando para executar a aplicação quando o contêiner iniciar.
# Este comando será passado como argumento para o ENTRYPOINT.
CMD ["./main"]
