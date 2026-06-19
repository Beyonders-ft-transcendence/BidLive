#!/bin/sh
set -e

SERVICE_ROLE="${SERVICE_ROLE:-django}"

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
echo "PostgreSQL is up."

if [ "$SERVICE_ROLE" = "django" ]; then
  echo "Running migrations..."
  python manage.py migrate --noinput

  if [ "${DJANGO_COLLECTSTATIC:-0}" = "1" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
  fi

  echo "Starting Django application..."
  exec gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker -c tools/gunicorn.conf.py

elif [ "$SERVICE_ROLE" = "celery-worker" ]; then
  echo "Starting Celery Worker..."
  exec celery -A config worker -l info

elif [ "$SERVICE_ROLE" = "celery-beat" ]; then
  echo "Starting Celery Beat..."
  exec celery -A config beat -l info

else
  echo "Unknown SERVICE_ROLE: $SERVICE_ROLE"
  echo "Valid roles: django, celery-worker, celery-beat"
  exit 1
fi
