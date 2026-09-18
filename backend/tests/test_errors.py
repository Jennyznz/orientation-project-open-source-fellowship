import logging

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.config import settings
from app.errors import register_exception_handlers
from app.main import app
from app.routes import chat

client = TestClient(app, raise_server_exceptions=False)


@pytest.mark.parametrize(
    "path, message",
    [
        ("/api/missing", "Not Found"),
        ("/api/conversations/missing", "Conversation not found"),
    ],
)
def test_not_found(path, message):
    response = client.get(path)
    assert response.status_code == 404
    assert response.headers["content-type"] == "application/json"
    assert response.json() == {"error": {"code": 404, "message": message}}


@pytest.mark.parametrize(
    "method, path, kwargs",
    [
        ("get", "/api/conversations?limit=0", {}),
        ("get", "/api/conversations?limit=abc", {}),
        ("post", "/api/conversations/missing/messages", {"json": {}}),
        ("patch", "/api/conversations/missing", {"json": {"title": "   "}}),
        (
            "post",
            "/api/conversations",
            {"content": "{", "headers": {"Content-Type": "application/json"}},
        ),
    ],
)
def test_request_validation(method, path, kwargs):
    response = client.request(method, path, **kwargs)
    assert response.status_code == 422
    assert response.json() == {
        "error": {"code": 422, "message": "Request validation failed"}
    }


def test_method_not_allowed_preserves_allow_header():
    response = client.put("/api/conversations")
    assert response.status_code == 405
    assert response.headers["allow"]
    assert response.json() == {
        "error": {"code": 405, "message": "Method Not Allowed"}
    }


def test_http_exception_preserves_custom_headers():
    test_app = FastAPI()
    register_exception_handlers(test_app)

    @test_app.get("/protected")
    def protected():
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    response = TestClient(test_app).get("/protected")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.json() == {
        "error": {"code": 401, "message": "Authentication required"}
    }


@pytest.mark.parametrize("origin", [None, settings.frontend_origin, "https://untrusted.example"])
def test_unhandled_exception_is_logged_without_exposing_details(monkeypatch, caplog, origin):
    def broken_provider():
        raise RuntimeError("private provider credentials")

    monkeypatch.setattr(chat, "get_llm_provider", broken_provider)
    conversation = client.post("/api/conversations", json={}).json()
    with caplog.at_level(logging.ERROR, logger="app.errors"):
        response = client.post(
            f"/api/conversations/{conversation['id']}/messages",
            json={"content": "hello"},
            headers={"Origin": origin} if origin else {},
        )

    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": 500, "message": "Internal server error"}
    }
    assert "private provider credentials" not in response.text
    if origin == settings.frontend_origin:
        assert response.headers["access-control-allow-origin"] == origin
        assert response.headers["access-control-allow-credentials"] == "true"
        assert "Origin" in response.headers["vary"]
    else:
        assert "access-control-allow-origin" not in response.headers
    assert any(
        record.name == "app.errors" and record.exc_info
        for record in caplog.records
    )


def test_cors_preflight():
    response = client.options(
        "/api/conversations",
        headers={
            "Origin": settings.frontend_origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == settings.frontend_origin
    assert "POST" in response.headers["access-control-allow-methods"]
