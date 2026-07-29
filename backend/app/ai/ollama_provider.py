import json
from typing import Optional
import httpx
from .base import BaseLLMProvider, AIReviewResult, ReviewItem, AI_SYSTEM_PROMPT
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("ollama")

class OllamaProvider(BaseLLMProvider):
    @property
    def name(self) -> str:
        return "ollama"

    async def is_available(self) -> bool:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                return r.status_code == 200
        except Exception:
            return False

    async def review_code(self, file_path: str, content: str, context: str = "") -> Optional[AIReviewResult]:
        settings = get_settings()
        prompt = f"{AI_SYSTEM_PROMPT}\n\nFile: {file_path}\n```python\n{content[:4000]}\n```"
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                r = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"}
                )
                data = r.json()
                return self._parse(data.get("response", "{}"))
        except Exception as e:
            logger.error(f"Ollama error: {e}")
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
