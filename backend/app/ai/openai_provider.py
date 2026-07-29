import json
from typing import Optional
from .base import BaseLLMProvider, AIReviewResult, ReviewItem, AI_SYSTEM_PROMPT
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("openai")

class OpenAIProvider(BaseLLMProvider):
    @property
    def name(self) -> str:
        return "openai"

    async def is_available(self) -> bool:
        settings = get_settings()
        return bool(settings.OPENAI_API_KEY)

    async def review_code(self, file_path: str, content: str, context: str = "") -> Optional[AIReviewResult]:
        settings = get_settings()
        if not settings.OPENAI_API_KEY:
            return None
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            user_msg = f"File: {file_path}\n\n```python\n{content[:4000]}\n```"
            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[{"role": "system", "content": AI_SYSTEM_PROMPT}, {"role": "user", "content": user_msg}],
                response_format={"type": "json_object"}, max_tokens=2000, temperature=0.1
            )
            return self._parse(response.choices[0].message.content or "{}")
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return None

    def _parse(self, raw: str) -> Optional[AIReviewResult]:
        try:
            data = json.loads(raw)
            def items(key):
                return [ReviewItem(issue=i.get("issue",""), suggestion=i.get("suggestion",""), severity=i.get("severity","medium")) for i in data.get(key, [])]
            return AIReviewResult(
                bugs=items("bugs"), performance=items("performance"), security=items("security"),
                readability=items("readability"), maintainability=items("maintainability"),
                solid_violations=items("solid_violations"), design_patterns=items("design_patterns"),
                scalability=items("scalability"), summary=data.get("summary", ""),
                score_adjustment=data.get("score_adjustment", 0)
            )
        except Exception:
            return None
