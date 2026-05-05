#!/bin/bash
set -e

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    export POSTGRES_PASSWORD="$(cat /run/secrets/db_password)"

    initdb -D "$PGDATA"

    pg_ctl -D "$PGDATA" -o "-c listen_addresses='localhost'" -w start

    psql -U postgres -c "CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"

    psql -U postgres -c "CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;"

    psql -U postgres -c "ALTER USER $POSTGRES_USER CREATEDB;"

    pg_ctl -D "$PGDATA" -m fast -w stop
fi

echo "Starting PostgreSQL..."
exec postgres -D "$PGDATA"