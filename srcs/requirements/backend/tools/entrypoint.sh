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

if [ -f /run/secrets/livekit_credenciais ]; then
    LIVEKIT_API_KEY=$(sed -n '1p' /run/secrets/livekit_credenciais | cut -d'=' -f2 | tr -d '\r')
    LIVEKIT_API_SECRET=$(sed -n '2p' /run/secrets/livekit_credenciais | cut -d'=' -f2 | tr -d '\r')
    export LIVEKIT_API_KEY LIVEKIT_API_SECRET
fi

if [ -f /run/secrets/backend_credenciais ]; then
    SECRET_KEY=$(sed -n '1p' /run/secrets/backend_credenciais | cut -d'=' -f2 | tr -d '\r')
    EMAIL_USER=$(sed -n '2p' /run/secrets/backend_credenciais | cut -d'=' -f2 | tr -d '\r')
    EMAIL_PASSWORD=$(sed -n '3p' /run/secrets/backend_credenciais | cut -d'=' -f2 | tr -d '\r')
    export SECRET_KEY EMAIL_USER EMAIL_PASSWORD
fi

if [ -f /run/secrets/42_credenciais ]; then
    FORTY_TWO_CLIENT_ID=$(sed -n '1p' /run/secrets/42_credenciais | cut -d'=' -f2 | tr -d '\r')
    FORTY_TWO_CLIENT_SECRET=$(sed -n '2p' /run/secrets/42_credenciais | cut -d'=' -f2 | tr -d '\r')
    FORTY_TWO_REDIRECT_URI=$(sed -n '3p' /run/secrets/42_credenciais | cut -d'=' -f2 | tr -d '\r')
    export FORTY_TWO_CLIENT_ID FORTY_TWO_CLIENT_SECRET FORTY_TWO_REDIRECT_URI
fi

if [ -f /run/secrets/google_credenciais ]; then
    GOOGLE_CLIENT_ID=$(sed -n '1p' /run/secrets/google_credenciais | cut -d'=' -f2 | tr -d '\r')
    GOOGLE_CLIENT_SECRET=$(sed -n '2p' /run/secrets/google_credenciais | cut -d'=' -f2 | tr -d '\r')
    export GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET
fi

if [ -f /run/secrets/db_credenciais ]; then
    POSTGRES_PASSWORD=$(sed -n '1p' /run/secrets/db_credenciais | cut -d'=' -f2 | tr -d '\r')
    export POSTGRES_PASSWORD
    export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST:-postgres}:${POSTGRES_PORT}/${POSTGRES_DB}"
fi
if [ -f /run/secrets/redis_credenciais ]; then
    REDIS_PASSWORD=$(sed -n '1p' /run/secrets/redis_credenciais | cut -d'=' -f2 | tr -d '\r')
    REDIS_HOST=redis
    export REDIS_HOST REDIS_PORT REDIS_USER REDIS_PASSWORD
    export REDIS_URL="redis://$REDIS_USER:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT/0"
    export CELERY_BROKER_URL="redis://$REDIS_USER:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT/1"
    export CELERY_RESULT_BACKEND="redis://$REDIS_USER:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT/2"
fi
while ! nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  sleep 1
done
echo "PostgreSQL is up."

if [ "$SERVICE_ROLE" = "django" ]; then
  echo "Running migrations..."
  python manage.py migrate --noinput

  echo "Creating default objects..."
  python manage.py seed --force

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
