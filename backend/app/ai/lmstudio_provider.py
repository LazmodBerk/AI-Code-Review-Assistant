from typing import Optional
from .base import BaseLLMProvider, AIReviewResult, AI_SYSTEM_PROMPT
from .openai_provider import OpenAIProvider
from app.core.config import get_settings
import httpx

class LMStudioProvider(OpenAIProvider):
    @property
    def name(self) -> str:
        return "lmstudio"

    async def is_available(self) -> bool:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{settings.LMSTUDIO_BASE_URL}/v1/models")
                return r.status_code == 200
        except Exception:
            return False

    async def review_code(self, file_path: str, content: str, context: str = "") -> Optional[AIReviewResult]:
        settings = get_settings()
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key="lmstudio", base_url=f"{settings.LMSTUDIO_BASE_URL}/v1")
            user_msg = f"File: {file_path}\n\n```python\n{content[:4000]}\n```"
            response = await client.chat.completions.create(
                model=settings.LMSTUDIO_MODEL,
                messages=[{"role": "system", "content": AI_SYSTEM_PROMPT}, {"role": "user", "content": user_msg}],
                max_tokens=2000, temperature=0.1
            )
            return self._parse(response.choices[0].message.content or "{}")
        except Exception:
            return None
