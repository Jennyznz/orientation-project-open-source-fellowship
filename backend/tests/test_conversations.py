from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _create_conversation(title=None):
    payload = {"title": title} if title else {}
    return client.post("/api/conversations", json=payload)


def test_list_conversations_default_pagination():
    for i in range(3):
        _create_conversation(f"Convo {i}")

    response = client.get("/api/conversations")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 3
    assert body["limit"] == 20
    assert body["offset"] == 0
    assert len(body["items"]) == 3


def test_list_conversations_respects_limit_and_offset():
    for i in range(5):
        _create_conversation(f"Convo {i}")

    response = client.get("/api/conversations", params={"limit": 2, "offset": 1})
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 5
    assert body["limit"] == 2
    assert body["offset"] == 1
    assert len(body["items"]) == 2


def test_list_conversations_rejects_invalid_limit():
    response = client.get("/api/conversations", params={"limit": 0})
    assert response.status_code == 422

    response = client.get("/api/conversations", params={"limit": 101})
    assert response.status_code == 422
