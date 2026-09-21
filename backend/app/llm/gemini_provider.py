"""Google Gemini implementation of LLMProvider.

Uses the free-tier-eligible Gemini API. Get a key at
https://aistudio.google.com/apikey
"""

from collections.abc import AsyncIterator
from contextlib import closing

from google import genai
from google.genai import types
from starlette.concurrency import iterate_in_threadpool

from app.config import settings
from app.llm.base import LLMProvider

model = settings.gemini_model


class GeminiProvider(LLMProvider):
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.gemini_api_key)

    def generate_reply(self, history: list[dict], system_prompt: str) -> str:
        # Gemini uses "model" instead of "assistant" for the assistant role,
        # and expects content as a list of Part objects rather than a plain string.
        contents = [
            types.Content(
                role="model" if m["role"] == "assistant" else "user",
                parts=[types.Part(text=m["content"])],
            )
            for m in history
        ]

        response = self.client.models.generate_content(
            model=model,
            contents=contents,
            # Gemini takes the system prompt as config, not as an entry in contents.
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
        return response.text

    def generate_conversation_title(self, message: str) -> str:
        response = self.client.models.generate_content(
            model=model,
            contents=[
                types.Content(
                    role="user",
                    parts=[types.Part(text=message)],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=(
                    "Generate a short, plain-text title (3-6 words) summarizing "
                    "this message. No quotes, no markdown, no trailing punctuation."
                ),
                max_output_tokens=20,
            ),
        )
        return response.text

    async def stream_reply(
        self, history: list[dict], system_prompt: str
    ) -> AsyncIterator[str]:
        contents = [
            types.Content(
                role="model" if m["role"] == "assistant" else "user",
                parts=[types.Part(text=m["content"])],
            )
            for m in history
        ]
        stream = self.client.models.generate_content_stream(
            model=settings.gemini_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                http_options=types.HttpOptions(timeout=30000),
            ),
        )
        with closing(stream):
            async for chunk in iterate_in_threadpool(stream):
                if chunk.text:
                    yield chunk.text
