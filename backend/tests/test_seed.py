from app.models import Conversation, Message
from conftest import TestingSessionLocal
from scripts.seed import SAMPLE_CONVERSATIONS, seed


def test_seed_creates_sample_conversations_and_messages():
    db = TestingSessionLocal()
    try:
        seed(db)

        conversations = db.query(Conversation).all()
        assert len(conversations) == len(SAMPLE_CONVERSATIONS)

        messages = db.query(Message).all()
        expected_message_count = sum(len(c["messages"]) for c in SAMPLE_CONVERSATIONS)
        assert len(messages) == expected_message_count

        for convo in conversations:
            assert len(convo.messages) > 0
    finally:
        db.close()
