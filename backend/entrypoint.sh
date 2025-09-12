#!/bin/sh
# entrypoint.sh

# Este script espera até que a base de dados PostgreSQL esteja pronta para aceitar conexões.

# As variáveis de ambiente DB_HOST e DB_PORT são passadas pelo docker-compose.yml
DB_ADDRESS="${DB_HOST}:${DB_PORT}"

echo "A aguardar pela base de dados em ${DB_ADDRESS}..."

# O comando nc (netcat) tenta estabelecer uma conexão.
# O loop 'while ! nc ...' continuará enquanto a conexão falhar.
# -z: faz o nc verificar apenas se a porta está a escutar, sem enviar dados.
# -w1: timeout de 1 segundo para a tentativa de conexão.
while ! nc -z -w1 "${DB_HOST}" "${DB_PORT}"; do
  echo "A base de dados ainda não está pronta. A tentar novamente em 2 segundos..."
  sleep 2
done

echo "Base de dados pronta! A iniciar a aplicação..."

# O comando 'exec "$@"' executa o comando que foi passado para o script.
# Neste caso, será o CMD do Dockerfile (ou seja, "./main").
exec "$@"
