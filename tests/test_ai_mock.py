import sys
import asyncio
import pytest
sys.path.insert(0, 'backend')
from app.ai.factory import NullProvider
from app.ai.base import AIReviewResult

@pytest.mark.asyncio
async def test_null_provider_returns_none():
    p = NullProvider()
    result = await p.review_code('test.py', 'x = 1')
    assert result is None

@pytest.mark.asyncio
async def test_null_provider_is_available():
    p = NullProvider()
    assert await p.is_available() is True

@pytest.mark.asyncio
async def test_openai_provider_parse():
    from app.ai.openai_provider import OpenAIProvider
    p = OpenAIProvider()
    raw = '{"bugs": [{"issue": "test bug", "suggestion": "fix it", "severity": "high"}], "performance": [], "security": [], "readability": [], "maintainability": [], "solid_violations": [], "design_patterns": [], "scalability": [], "summary": "Test summary", "score_adjustment": 0}'
    result = p._parse(raw)
    assert result is not None
    assert len(result.bugs) == 1
    assert result.bugs[0].issue == 'test bug'
    assert result.summary == 'Test summary'
