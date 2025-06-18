# Open Denkaru Development Makefile
# Provides convenient commands for development workflow

.PHONY: help
help: ## Show this help message
	@echo "Open Denkaru Development Commands"
	@echo "================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Environment
.PHONY: setup
setup: ## Set up development environment
	@echo "Setting up Open Denkaru development environment..."
	@cp .env.example .env
	@echo "✅ Created .env file (please customize it)"
	@echo "Next steps:"
	@echo "  1. Edit .env file with your settings"
	@echo "  2. Run 'make up' to start the development environment"

.PHONY: up
up: ## Start development environment
	@echo "Starting Open Denkaru development environment..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started!"
	@echo "📱 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:8000"
	@echo "📊 API Docs: http://localhost:8000/docs"
	@echo "💾 Database Admin: http://localhost:5050"
	@echo "🔍 Cache Admin: http://localhost:8081"
	@echo "📈 Monitoring: http://localhost:3001"
	@echo "🔬 Jupyter Lab: http://localhost:8888"

.PHONY: down
down: ## Stop development environment
	@echo "Stopping Open Denkaru development environment..."
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml down
	@echo "✅ Development environment stopped"

.PHONY: restart
restart: down up ## Restart development environment

.PHONY: logs
logs: ## View logs from all services
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

.PHONY: logs-backend
logs-backend: ## View backend logs
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

.PHONY: logs-frontend
logs-frontend: ## View frontend logs
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

# Database Management
.PHONY: db-shell
db-shell: ## Connect to database shell
	@docker compose exec postgres psql -U postgres -d open_denkaru_dev

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@docker compose exec backend alembic upgrade head

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  This will destroy all database data. Are you sure? [y/N]"
	@read -r response; if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
		docker compose down -v postgres; \
		docker compose up -d postgres; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Database reset cancelled"; \
	fi

# Development Tools
.PHONY: shell-backend
shell-backend: ## Access backend container shell
	@docker compose exec backend bash

.PHONY: shell-frontend
shell-frontend: ## Access frontend container shell
	@docker compose exec frontend sh

.PHONY: test
test: ## Run all tests
	@echo "Running Open Denkaru test suite..."
	@docker compose exec backend pytest
	@docker compose exec frontend npm test

.PHONY: test-backend
test-backend: ## Run backend tests
	@docker compose exec backend pytest -v

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@docker compose exec frontend npm test

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@docker compose exec backend pytest --cov=. --cov-report=html
	@echo "📊 Coverage report generated in backend/htmlcov/"

.PHONY: lint
lint: ## Run linting on all code
	@echo "Running linters..."
	@docker compose exec backend ruff check .
	@docker compose exec backend black --check .
	@docker compose exec backend mypy .
	@docker compose exec frontend npm run lint

.PHONY: lint-fix
lint-fix: ## Auto-fix linting issues
	@echo "Auto-fixing lint issues..."
	@docker compose exec backend ruff check . --fix
	@docker compose exec backend black .
	@docker compose exec frontend npm run lint:fix

.PHONY: format
format: ## Format all code
	@echo "Formatting code..."
	@docker compose exec backend black .
	@docker compose exec backend isort .
	@docker compose exec frontend npm run format

# AI and Research
.PHONY: ollama-pull
ollama-pull: ## Download AI models for local development
	@echo "Downloading AI models..."
	@docker compose exec ollama ollama pull llama2
	@docker compose exec ollama ollama pull codellama
	@echo "✅ AI models downloaded"

.PHONY: jupyter
jupyter: ## Open Jupyter Lab for research
	@echo "🔬 Jupyter Lab: http://localhost:8888"
	@echo "🔑 Token: denkaru-research"

# Monitoring and Maintenance
.PHONY: status
status: ## Show status of all services
	@docker compose ps

.PHONY: health
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend: Healthy" || echo "❌ Frontend: Unhealthy"
	@curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend: Healthy" || echo "❌ Backend: Unhealthy"
	@docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1 && echo "✅ Database: Healthy" || echo "❌ Database: Unhealthy"
	@docker compose exec redis redis-cli ping > /dev/null 2>&1 && echo "✅ Cache: Healthy" || echo "❌ Cache: Unhealthy"

.PHONY: clean
clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	@docker compose down -v --remove-orphans
	@docker system prune -f
	@echo "✅ Cleanup complete"

.PHONY: backup-db
backup-db: ## Backup database
	@echo "Creating database backup..."
	@mkdir -p ./backups
	@docker compose exec postgres pg_dump -U postgres open_denkaru_dev > ./backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in ./backups/"

.PHONY: restore-db
restore-db: ## Restore database from backup (specify BACKUP_FILE)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Please specify BACKUP_FILE: make restore-db BACKUP_FILE=./backups/backup.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(BACKUP_FILE)..."
	@docker compose exec -T postgres psql -U postgres -d open_denkaru_dev < $(BACKUP_FILE)
	@echo "✅ Database restored"

# Production Utilities
.PHONY: build
build: ## Build production images
	@echo "Building production images..."
	@docker compose -f docker-compose.yml build

.PHONY: security-scan
security-scan: ## Run security scans
	@echo "Running security scans..."
	@docker compose exec backend safety check
	@docker compose exec frontend npm audit
	@echo "✅ Security scan complete"

# Documentation
.PHONY: docs
docs: ## Generate documentation
	@echo "Generating documentation..."
	@docker compose exec backend sphinx-build -b html docs/ docs/_build/
	@echo "📚 Documentation generated in docs/_build/"

.PHONY: api-docs
api-docs: ## View API documentation
	@echo "🔧 API Documentation: http://localhost:8000/docs"
	@echo "📋 Alternative UI: http://localhost:8000/redoc"

# Git Helpers
.PHONY: git-setup
git-setup: ## Set up git hooks and configuration
	@echo "Setting up git hooks..."
	@cp .githooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Git hooks installed"

# Quick Development Commands
.PHONY: dev
dev: up ## Alias for 'up' - start development environment

.PHONY: stop
stop: down ## Alias for 'down' - stop development environment

.PHONY: fresh-start
fresh-start: clean setup up ## Clean everything and start fresh

# Help Information
.PHONY: info
info: ## Show development environment information
	@echo "Open Denkaru Development Environment"
	@echo "==================================="
	@echo ""
	@echo "🌐 Service URLs:"
	@echo "  Frontend:     http://localhost:3000"
	@echo "  Backend API:  http://localhost:8000"
	@echo "  API Docs:     http://localhost:8000/docs"
	@echo "  PgAdmin:      http://localhost:5050"
	@echo "  Redis UI:     http://localhost:8081"
	@echo "  Grafana:      http://localhost:3001"
	@echo "  Jupyter:      http://localhost:8888"
	@echo "  MinIO:        http://localhost:9001"
	@echo ""
	@echo "🔑 Default Credentials:"
	@echo "  Database:     postgres/postgres"
	@echo "  PgAdmin:      admin@open-denkaru.local/admin"
	@echo "  Grafana:      admin/admin"
	@echo "  Jupyter:      token: denkaru-research"
	@echo "  MinIO:        minioadmin/minioadmin"
	@echo ""
	@echo "📁 Important Directories:"
	@echo "  Backend:      ./backend/"
	@echo "  Frontend:     ./frontend/"
	@echo "  Database:     ./database/"
	@echo "  Docs:         ./docs/"
	@echo "  Research:     ./research/"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make setup    # Initial setup"
	@echo "  make up       # Start everything"
	@echo "  make test     # Run tests"
	@echo "  make logs     # View logs"