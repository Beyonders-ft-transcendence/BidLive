#!/bin/sh
set -e

if [ -f /run/secrets/db_credenciais ]; then
    DATABASE_PASSWORD=$(sed -n '1p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
    export DATABASE_PASSWORD
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
    su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses='*' -c port='$DATABASE_PORT'" -w start

    echo "Criando usuários e bancos..."
    su-exec postgres psql -p "$DATABASE_PORT" -U postgres -c "CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';"
    su-exec postgres psql -p "$DATABASE_PORT" -U postgres -c "CREATE DATABASE $DATABASE_DB OWNER $DATABASE_USER;"
    su-exec postgres psql -p "$DATABASE_PORT" -U postgres -c "ALTER USER $DATABASE_USER CREATEDB;"

    echo "Desligando a instância temporária..."
    su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop
fi

# Permite conexões externas na rede Docker
if [ -f "$PGDATA/pg_hba.conf" ]; then
    if ! grep -q "0.0.0.0/0" "$PGDATA/pg_hba.conf"; then
        echo "host all all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
    fi
    if ! grep -q "::/0" "$PGDATA/pg_hba.conf"; then
        echo "host all all ::/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
    fi
fi

echo "Starting PostgreSQL na porta $DATABASE_PORT..."
exec su-exec postgres postgres -D "$PGDATA" -c listen_addresses='*' -c port="$DATABASE_PORT"
