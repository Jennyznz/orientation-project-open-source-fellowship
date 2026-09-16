ifeq ($(OS),Windows_NT)
    VENV_BIN_DIR := Scripts
    PYTHON := python
else
    VENV_BIN_DIR := bin
    PYTHON := python3
endif

BACKEND_VENV := backend/.venv/$(VENV_BIN_DIR)

.PHONY: backend-install backend-run frontend-install frontend-run dev

backend-install:
	cd backend && $(PYTHON) -m venv .venv
	$(BACKEND_VENV)/pip install --upgrade pip
	$(BACKEND_VENV)/pip install -r backend/requirements.txt
	test -f backend/.env || cp backend/.env.example backend/.env

backend-run:
	$(BACKEND_VENV)/uvicorn app.main:app --reload --reload-dir backend --port 8000 --app-dir backend

frontend-install:
	cd frontend && npm install

frontend-run:
	cd frontend && npm run dev

dev:
	./scripts/dev.sh
