# variables
DB_SERVICE=db
BACKEND_CONTAINER=backend
DB_URL=mysql://root:$(shell grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)@tcp(localhost:3306)/$(shell grep MYSQL_DATABASE .env | cut -d '=' -f2)

GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
RED=\033[0;31m
NC=\033[0m

.PHONY: help build run clean deps tidy docker-build docker-up docker-down docker-restart docker-logs-backend docker-logs-db docker-exec-db db-up db-down db-reset migrate-up migrate-down seed-up seed-down stop-all ab-benchmark

.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(GREEN)Zesty Go Backend - Available Commands$(NC)"
	@echo "======================================"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"}; /^[a-zA-Z_-]+:.*##/ { printf "  $(BLUE)%-18s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

build: ## Build the Go application
	@echo "$(YELLOW)Building Zesty...$(NC)"
	go build -o main ./cmd/main.go
	@echo "$(GREEN)[i] Build completed: main$(NC)"

run: ## Run the application directly with Go
	@echo "$(YELLOW)[i] Starting Zesty...$(NC)"
	go run ./cmd/main.go

clean: ## Clean build files
	@echo "$(YELLOW)[i] Cleaning build files...$(NC)"
	go clean
	rm -f main
	@echo "$(GREEN)[i] Clean completed$(NC)"

deps: ## Download and verify dependencies
	@echo "$(YELLOW)[i] Downloading dependencies...$(NC)"
	cd backend && \
		go mod download && \
		go mod verify && \
		go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	cd ../
	@echo "$(GREEN)[i] Dependencies updated$(NC)"

tidy: ## Tidy up go.mod and go.sum
	@echo "$(YELLOW)[i] Tidying up dependencies...$(NC)"
	go mod tidy
	@echo "$(GREEN)[i] Dependencies tidied$(NC)"

docker-build: ## Build Docker containers
	@echo "$(YELLOW)[i] Building Docker containers...$(NC)"
	docker compose build
	@echo "$(GREEN)[i] Docker build completed$(NC)"

docker-up: ## Start all services with Docker Compose
	@echo "$(YELLOW)[i] Starting all services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)[i] Services started$(NC)"

docker-down: ## Stop all services
	@echo "$(YELLOW)[i] Stopping all services...$(NC)"
	docker compose down
	@echo "$(GREEN)[i] Services stopped$(NC)"

docker-restart: ## Restart all services
	@echo "$(YELLOW)[i] Restarting all services...$(NC)"
	docker compose restart
	@echo "$(GREEN)[i] Services restarted$(NC)"

docker-logs-backend: ## Show logs from backend service only
	docker logs -f $(BACKEND_CONTAINER)

docker-logs-db: ## Show logs from database service only
	docker logs -f $(DB_SERVICE)

docker-exec-db: ## Execute MySQL shell in database container
	docker exec -it $(DB_SERVICE) mysql -u root -p$(shell grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)

db-up: ## Start only the database service
	@echo "$(YELLOW)[i] Starting database...$(NC)"
	docker compose up -d $(DB_SERVICE)
	@echo "$(GREEN)[i] Database started$(NC)"

db-down: ## Stop the database service
	@echo "$(YELLOW)[i] Stopping database...$(NC)"
	docker compose stop $(DB_SERVICE)
	@echo "$(GREEN)[i] Database stopped$(NC)"

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "$(RED)[!] WARNING: This will delete all database data!$(NC)"
	@read -p "[?] Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker compose down -v
	docker volume rm $$(docker compose config | grep -A 1 'volumes:' | tail -1 | sed 's/.*name: //' | tr -d ' ') 2>/dev/null || true
	docker compose up -d $(DB_SERVICE)
	@echo "$(GREEN)[i] Database reset completed$(NC)"

migrate-up: ## Run all UP migrations
	@echo "$(YELLOW)[i] Running UP migrations...$(NC)"
	migrate -path ./backend/db/migrations -database "$(DB_URL)" up
	@echo "$(GREEN)[i] All UP migrations completed$(NC)"

migrate-down: ## Run ALL DOWN migrations (destructive)
	@echo "$(RED)[!] WARNING: This will run ALL DOWN migrations and may drop tables!$(NC)"
	@read -p "[?] Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || (echo "aborted"; exit)
	@echo "$(YELLOW)[i] Running ALL DOWN migrations...$(NC)"
	migrate -path ./backend/db/migrations -database "$(DB_URL)" down
	@echo "$(GREEN)[i] All DOWN migrations completed$(NC)"

seeds-up: ## Apply all seed UP SQL files (non-migrate)
	@echo "$(YELLOW)[i] Running UP seeds...$(NC)"
	migrate -path ./backend/db/seeds -database "$(DB_URL)?x-migrations-table=seeds_schema" up
	@echo "$(GREEN)[i] All UP seeds completed$(NC)"

seeds-down: ## Run ALL DOWN migrations (destructive)
	@echo "$(RED)[!] WARNING: This will run ALL DOWN seeds and may delete data!$(NC)"
	@read -p "[?] Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || (echo "aborted"; exit)
	@echo "$(YELLOW)[i] Running ALL DOWN seeds...$(NC)"
	migrate -path ./backend/db/seeds -database "$(DB_URL)?x-migrations-table=seeds_schema" down
	@echo "$(GREEN)[i] All DOWN seeds completed$(NC)"

testbench: ## Run benchmarks using Apache Benchmark
	@echo "$(GREEN)[i] Starting benchmark setup...$(NC)"
	@echo "$(YELLOW)[i] Setting up services...$(NC)"
	$(MAKE) docker-up
	@echo "$(YELLOW)[i] Waiting for services to start...$(NC)"
	@sleep 5
	@echo "$(YELLOW)[i] Running migrations...$(NC)"
	$(MAKE) migrate-up
	@echo "$(YELLOW)[i] Running seeds...$(NC)"
	$(MAKE) seeds-up
	@echo "$(YELLOW)[i] Getting authentication token...$(NC)"
	COOKIE=$(curl -i -X POST "http://localhost:3001/api/auth/login" -H "Content-Type: application/json" -d '{"email": "admin@zes.ty", "password": "qwertyasdf"}' | grep -oP 'token=\K[^;]+')
	@echo "$(YELLOW)[i] Running Apache Benchmark (100k requests, 1k concurrent)...$(NC)"
	ab -n 100000 -c 1000 -H "Cookie: token=$(COOKIE)" "http://localhost:3001/api/order/all-items"
	@echo "$(GREEN)[i] Benchmarks completed$(NC)"

stop-all: ## Stop all running containers and clean up
	@echo "$(YELLOW)Stopping all containers and cleaning up...$(NC)"
	docker compose down
	docker system prune -f
	@echo "$(GREEN)All containers stopped and cleaned up$(NC)"