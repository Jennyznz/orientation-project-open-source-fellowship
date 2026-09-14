# Orientation Project - Open Source Fellowship

A barebones full-stack LLM chat application, built as a starting point for
MLH fellows to extend.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite. Talks to an LLM through a small pluggable provider interface.
- **Frontend:** JavaScript, React, Vite (Node-based tooling).
- **Communication:** Frontend calls the backend REST API (Vite dev
  server proxies `/api` to `http://localhost:8000`).

## Project layout

```
backend/
  app/
    main.py          # FastAPI app + router registration
    config.py         # env-based settings
    database.py        # SQLAlchemy engine/session
    models.py          # Conversation, Message
    schemas.py          # Pydantic request/response models
    llm/                # pluggable LLM provider interface
    routes/             # health + conversation/chat endpoints
  tests/
frontend/
  src/
    App.jsx             # barebones single-conversation chat UI
    components/          # MessageList, MessageInput
    api/client.js         # fetch wrapper for backend API
scripts/dev.sh            # runs backend + frontend together
```

## Getting started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then add your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173`.

### Or run both at once

```bash
./scripts/dev.sh
```

## What's the point?
We want you to learn how to work on Open Source Projects, create PRs and tackling issues. 
Your Pod Leader will be the maintainer of this project, closing PRs and managing the repository.
