"""Anthropic API implementation of LLMProvider."""
import anthropic

from app.config import settings
from app.llm.base import LLMProvider


class AnthropicProvider(LLMProvider):
    def __init__(self) -> None:
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def generate_reply(self, history: list[dict]) -> str:
        response = self.client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            messages=history,
        )
        return "".join(block.text for block in response.content if block.type == "text")
