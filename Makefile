.PHONY: all build up down clean fclean re logs bonus bonus_build bonus_up

COMPOSE_FILE = srcs/docker-compose.yml
PROJECT_NAME = bidlive
DATA_PATH = /mnt/d/NdDaniel/Code/42/BidLive/data

all: build up

build:
	@echo "🔨 Building Docker images..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) build

up:
	@echo "🚀 Starting containers..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) up -d

down:
	@echo "🛑 Stopping containers..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down

clean: down
	@echo "🧹 Cleaning containers..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) down -v
	@docker system prune -af

fclean: clean
	@echo "🗑️  Removing all Docker data..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@docker rm $$(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	@docker network rm $$(docker network ls -q) 2>/dev/null || true
	@echo "🗑️  Removing persistent data directories..."
	@sudo rm -rf $(DATA_PATH)/adminer $(DATA_PATH)/backend $(DATA_PATH)/celery_worker $(DATA_PATH)/celery_beat $(DATA_PATH)/frontend $(DATA_PATH)/grafana $(DATA_PATH)/livekit $(DATA_PATH)/nginx $(DATA_PATH)/portainer $(DATA_PATH)/postgresql $(DATA_PATH)/prometheus $(DATA_PATH)/redis 2>/dev/null || true
	@echo "✅ All data removed!"

stop:
	@echo "🛑 Stopping containers..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) stop

logs:
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) logs -f

restart:
	@echo "🔄 Restarting containers..."
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) restart

status:
	@docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE) ps

re: fclean all

bre: fclean bonus
