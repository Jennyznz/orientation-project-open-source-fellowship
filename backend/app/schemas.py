from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MessageCreate(BaseModel):
    content: str = Field(
        ...,
        max_length=10000,
        description="The user's message content to send to the assistant.",
        examples=["What's the capital of France?"],
    )

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        if not value:
            raise ValueError("content must not be empty")
        return value


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "3f9a2b1c-4d5e-4f6a-8b7c-9d0e1f2a3b4c",
                "role": "assistant",
                "content": "Paris is the capital of France.",
                "created_at": "2026-01-01T12:00:00",
            }
        },
    )


class ConversationCreate(BaseModel):
    title: str | None = Field(
        default=None,
        description="Optional title. Defaults to 'New Conversation' if omitted.",
        examples=["Trip planning"],
    )


class ConversationUpdate(BaseModel):
    title: str = Field(
        ...,
        max_length=200,
        description="New title. Must not be blank after stripping whitespace.",
        examples=["Trip planning (updated)"],
    )

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        if not value:
            raise ValueError("title must not be empty")
        return value


class ConversationOut(BaseModel):
    id: str
    title: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
                "title": "Trip planning",
                "created_at": "2026-01-01T12:00:00",
            }
        },
    )


class ConversationDetailOut(ConversationOut):
    messages: list[MessageOut] = []


class ConversationListOut(BaseModel):
    items: list[ConversationOut]
    total: int = Field(
        description="Total number of conversations, ignoring limit/offset."
    )
    limit: int = Field(description="The limit that was applied to this response.")
    offset: int = Field(description="The offset that was applied to this response.")
