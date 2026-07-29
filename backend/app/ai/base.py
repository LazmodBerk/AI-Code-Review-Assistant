from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ReviewItem:
    issue: str
    suggestion: str
    severity: str

@dataclass
class AIReviewResult:
    bugs: List[ReviewItem] = field(default_factory=list)
    performance: List[ReviewItem] = field(default_factory=list)
    security: List[ReviewItem] = field(default_factory=list)
    readability: List[ReviewItem] = field(default_factory=list)
    maintainability: List[ReviewItem] = field(default_factory=list)
    solid_violations: List[ReviewItem] = field(default_factory=list)
    design_patterns: List[ReviewItem] = field(default_factory=list)
    scalability: List[ReviewItem] = field(default_factory=list)
    summary: str = ""
    score_adjustment: int = 0

class BaseLLMProvider(ABC):
    @abstractmethod
    async def review_code(self, file_path: str, content: str, context: str = "") -> Optional[AIReviewResult]: ...
    @property
    @abstractmethod
    def name(self) -> str: ...
    @abstractmethod
    async def is_available(self) -> bool: ...

AI_SYSTEM_PROMPT = """You are a senior software architect. Review the code and return ONLY valid JSON with this exact structure:
{"bugs": [{"issue": "...", "suggestion": "...", "severity": "critical|high|medium|low"}],
 "performance": [...same...],
 "security": [...same...],
 "readability": [...same...],
 "maintainability": [...same...],
 "solid_violations": [...same...],
 "design_patterns": [...same...],
 "scalability": [...same...],
 "summary": "Executive summary string",
 "score_adjustment": 0}
Be concise. Max 3 items per category."""
