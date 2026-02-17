"""OpenAI client setup, mirroring the TypeScript openai.ts."""

from openai import OpenAI
from app.config import settings


def get_openai_client() -> OpenAI:
    kwargs: dict = {"api_key": settings.resolved_api_key}
    base_url = settings.resolved_base_url
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)
