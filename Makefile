.PHONY: all build up down clean fclean re logs bonus bonus_build bonus_up ca

COMPOSE_FILE = srcs/docker-compose.yml
PROJECT_NAME = bidlive

all: ca build up

ca:
	@echo "🔑 Generating Root CA certificates (if needed)..."
	@bash srcs/ca/generate_ca.sh

build:
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
