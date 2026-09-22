"""Token usage recorded on assistant messages."""

from unittest.mock import Mock

from conftest import TestingSessionLocal
from fastapi.testclient import TestClient

from app.llm.base import LLMReply
from app.main import app
from app.models import Message
from app.routes import chat

client = TestClient(app)


def _mock_provider(monkeypatch, *replies):
    provider = Mock()
    provider.generate_reply.side_effect = list(replies)
    monkeypatch.setattr(chat, "get_llm_provider", lambda: provider)
    return provider


def _send(conversation_id, content="hi"):
    return client.post(
        f"/api/conversations/{conversation_id}/messages", json={"content": content}
    )


def test_usage_is_saved_on_the_assistant_message(monkeypatch):
    _mock_provider(
        monkeypatch, LLMReply(text="Paris.", prompt_tokens=12, completion_tokens=3)
    )
    convo = client.post("/api/conversations", json={}).json()

    reply = _send(convo["id"])

    assert reply.status_code == 200
    db = TestingSessionLocal()
    try:
        saved = db.get(Message, reply.json()["id"])
        assert (saved.prompt_tokens, saved.completion_tokens) == (12, 3)
        user_msg = db.query(Message).filter_by(role="user").one()
        assert (user_msg.prompt_tokens, user_msg.completion_tokens) == (None, None)
    finally:
        db.close()
