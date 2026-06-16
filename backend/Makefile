UV=uv

.PHONY: uv-sync dev runserver lint format test migrate makemigrations superuser worker beat seed seed-clear

all: container uv-sync migrate seed dev

uv-sync:
	$(UV) sync

dev:
	$(UV) run gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker -c tools/gunicorn.conf.py

container:
	docker run -d --name redis -p 6379:6379 redis:7-alpine
	docker run -d --name postgres -p 5432:5432 -e POSTGRES_DB=bidlive -e POSTGRES_USER=bidlive -e POSTGRES_PASSWORD=bidlive -v postgres_data:/var/lib/postgresql/data postgres:16-alpine
	docker run -d --name livekit -p 7880:7880 -p 7881:7881 -p 5000-5100:5000-5100/udp livekit/livekit-server:latest --dev --bind 0.0.0.0

container-clear:
	docker container stop redis postgres livekit
	docker container rm redis postgres livekit
	docker image prune -f

runserver:
	$(UV) run python manage.py runserver 0.0.0.0:8000

lint:
	$(UV) run ruff check .

format:
	$(UV) run black .
	$(UV) run isort .

test:
	$(UV) run pytest -q

migrate:
	$(UV) run python manage.py migrate

makemigrations:
	$(UV) run python manage.py makemigrations

superuser:
	$(UV) run python manage.py createsuperuser

worker:
	$(UV) run celery -A config worker -l info

beat:
	$(UV) run celery -A config beat -l info

seed:
	$(UV) run python manage.py seed

seed-clear:
	$(UV) run python manage.py seed --clear

clear: container-clear

ngrok:
	docker run --net=host -it -e NGROK_AUTHTOKEN=$YOUR_AUTHTOKEN ngrok/ngrok:latest http --url=giovani-tippiest-overapprehensively.ngrok-free.dev 8000
