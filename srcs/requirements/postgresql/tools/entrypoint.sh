#!/bin/sh
set -e

if [ -f /run/secrets/db_credenciais ]; then
    POSTGRES_USER=$(sed -n '1p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
    POSTGRES_PASSWORD=$(sed -n '2p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
    POSTGRES_DB=$(sed -n '3p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
    POSTGRES_PORT=$(sed -n '4p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
else
    echo "Error: No se encontró el archivo de credenciales."
    exit 1
fi    

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    
    mkdir -p "$PGDATA"
    chown -R postgres:postgres "$PGDATA"
    chmod 700 "$PGDATA"

    # CORRIGIDO AQUI: Sem a opção -o
    echo "Inicializando o banco de dados..."
    su-exec postgres initdb -D "$PGDATA"

    echo "Iniciando temporariamente para configuração..."
    su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='*' -c port='$POSTGRES_PORT'" -w start

    echo "Criando usuários e bancos..."
    su-exec postgres psql -p "$POSTGRES_PORT" -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"
    su-exec postgres psql -p "$POSTGRES_PORT" -U postgres -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"
    su-exec postgres psql -p "$POSTGRES_PORT" -U postgres -c "ALTER USER $POSTGRES_USER CREATEDB;"

    echo "Desligando a instância temporária..."
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
fi

echo "Starting PostgreSQL na porta $POSTGRES_PORT..."
exec su-exec postgres postgres -D "$PGDATA" -c listen_addresses='*' -c port="$POSTGRES_PORT"
