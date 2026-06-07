UV=uv

.PHONY: uv-sync dev runserver lint format test migrate makemigrations superuser worker beat seed seed-clear

uv-sync:
	$(UV) sync

dev:
	$(UV) run gunicorn config.asgi:application -k uvicorn.workers.UvicornWorker -c tools/gunicorn.conf.py

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

ngrok:
	docker run --net=host -it -e NGROK_AUTHTOKEN=$YOUR_AUTHTOKEN ngrok/ngrok:latest http --url=giovani-tippiest-overapprehensively.ngrok-free.dev 8000
