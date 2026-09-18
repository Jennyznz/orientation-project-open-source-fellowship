#!/usr/bin/env bash
set -e

trap 'kill 0' EXIT

if [ -x "backend/.venv/bin/uvicorn" ]; then
  UVICORN="backend/.venv/bin/uvicorn"
else
  UVICORN="backend/.venv/Scripts/uvicorn"
fi

"$UVICORN" app.main:app --reload --reload-dir backend --port 8000 --app-dir backend &
(cd frontend && npm run dev) &

wait
