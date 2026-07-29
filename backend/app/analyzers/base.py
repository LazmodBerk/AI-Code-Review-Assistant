from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class Category(str, Enum):
    SECURITY = "security"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    READABILITY = "readability"
    COMPLEXITY = "complexity"
    STYLE = "style"
    BUG = "bug"

@dataclass
class AnalysisIssue:
    file_path: str
    line_number: int
    column: int
    severity: Severity
    category: Category
    tool: str
    rule_id: str
    message: str
    suggestion: str
    code_snippet: Optional[str] = None

class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, file_path: str, content: str) -> List[AnalysisIssue]: ...
    @property
    @abstractmethod
    def name(self) -> str: ...
