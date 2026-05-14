#!/usr/bin/env sh
set -e

if [ -z "${DATABASE_HOST:-}" ]; then
  DATABASE_HOST="postgres"
fi
if [ -z "${DATABASE_PORT:-}" ]; then
  DATABASE_PORT="5432"
fi

echo "Waiting for PostgreSQL at ${DATABASE_HOST}:${DATABASE_PORT}..."
while ! nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 1
done

echo "PostgreSQL is up. Running migrations..."
python manage.py migrate --noinput

if [ "${DJANGO_COLLECTSTATIC:-0}" = "1" ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

echo "Starting application..."
exec "$@"
