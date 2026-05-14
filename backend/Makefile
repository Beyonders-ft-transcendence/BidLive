UV=uv

.PHONY: uv-sync dev lint format test migrate makemigrations superuser worker beat

uv-sync:
	$(UV) sync

dev:
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
