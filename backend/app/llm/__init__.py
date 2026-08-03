from app.config import settings
from app.llm.anthropic_provider import AnthropicProvider
from app.llm.base import LLMProvider


def get_llm_provider() -> LLMProvider:
    """Factory: returns the configured LLM provider. Extend with more
    branches as new providers are added (see ISSUES.md)."""
    if settings.llm_provider == "anthropic":
        return AnthropicProvider()
    raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")
