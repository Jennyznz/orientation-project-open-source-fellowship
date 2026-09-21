#!/usr/bin/env bash
set -e

if [ -x "backend/.venv/bin/uvicorn" ]; then
  UVICORN="backend/.venv/bin/uvicorn"
else
  UVICORN="backend\.venv\Scripts\uvicorn"
fi

CONCURRENTLY="frontend/node_modules/.bin/concurrently"

if [ ! -x "$CONCURRENTLY" ]; then
  echo "concurrently is not installed. Run 'make frontend-install' first." >&2
  exit 1
fi

exec "$CONCURRENTLY" \
  --kill-others \
  --names backend,frontend \
  --prefix-colors blue,green \
  "$UVICORN app.main:app --reload --reload-dir backend --port 8000 --app-dir backend" \
  "npm --prefix frontend run dev"
