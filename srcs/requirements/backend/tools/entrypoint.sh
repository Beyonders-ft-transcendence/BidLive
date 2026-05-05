#!/bin/sh
set -e

echo "Waiting for database..."

# espera PostgreSQL subir
while ! nc -z postgresql 5432; do
  sleep 1
done

echo "Database is up!"

# migrations
python manage.py migrate

# coletar arquivos estáticos (opcional)
python manage.py collectstatic --noinput

echo "Starting Django..."

# produção leve
exec python manage.py runserver 0.0.0.0:8000