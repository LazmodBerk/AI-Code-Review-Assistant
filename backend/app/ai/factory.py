from typing import Optional
from .base import BaseLLMProvider, AIReviewResult
from app.core.config import get_settings

class NullProvider(BaseLLMProvider):
    @property
    def name(self) -> str:
        return "none"
    async def is_available(self) -> bool:
        return True
    async def review_code(self, file_path: str, content: str, context: str = "") -> Optional[AIReviewResult]:
        return None

def get_llm_provider() -> BaseLLMProvider:
    settings = get_settings()
    provider = settings.LLM_PROVIDER
    if provider == "openai":
        from .openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif provider == "ollama":
        from .ollama_provider import OllamaProvider
        return OllamaProvider()
    elif provider == "lmstudio":
        from .lmstudio_provider import LMStudioProvider
        return LMStudioProvider()
    return NullProvider()
