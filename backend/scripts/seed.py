import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Conversation, Message

SAMPLE_CONVERSATIONS = [
    {
        "title": "Trip planning",
        "messages": [
            ("user", "What should I pack for a weekend in Lisbon?"),
            (
                "assistant",
                "Light layers, a rain jacket, and comfortable walking shoes -- "
                "Lisbon's hills are no joke.",
            ),
        ],
    },
    {
        "title": "Debugging help",
        "messages": [
            (
                "user",
                "My FastAPI endpoint returns a 500 on POST but works fine on GET.",
            ),
            (
                "assistant",
                "Check whether the request body matches your Pydantic schema -- "
                "a validation error before your handler runs often shows up as a 500 "
                "if it's not being caught.",
            ),
        ],
    },
]


def seed(db: Session) -> None:
    for entry in SAMPLE_CONVERSATIONS:
        convo = Conversation(title=entry["title"])
        db.add(convo)
        db.flush()
        for role, content in entry["messages"]:
            db.add(Message(conversation_id=convo.id, role=role, content=content))
    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
