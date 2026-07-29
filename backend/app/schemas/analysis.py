from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class IssueSchema(BaseModel):
    id: str
    file_path: str
    line_number: int
    column: int
    severity: str
    category: str
    tool: str
    rule_id: str
    message: str
    suggestion: str
    code_snippet: Optional[str] = None
    model_config = {"from_attributes": True}

class ScoresSchema(BaseModel):
    overall: float
    security: float
    performance: float
    maintainability: float
    readability: float
    architecture: float
    complexity: float

class AnalysisCreateResponse(BaseModel):
    analysis_id: str
    status: str

class AnalysisResult(BaseModel):
    id: str
    repo_name: str
    repo_url: Optional[str] = None
    status: str
    created_at: datetime
    total_files: int
    total_lines: int
    language_breakdown: Optional[dict] = None
    scores: ScoresSchema
    issues: list[IssueSchema]
    ai_review: Optional[dict] = None
    error_message: Optional[str] = None
    model_config = {"from_attributes": True}

class MetricsResponse(BaseModel):
    scores: ScoresSchema
    total_files: int
    total_lines: int
    total_issues: int
    issues_by_severity: dict[str, int]
    issues_by_category: dict[str, int]
    language_breakdown: Optional[dict] = None

class HistoryItem(BaseModel):
    id: str
    repo_name: str
    status: str
    created_at: datetime
    overall_score: float
    total_files: int
    total_issues: int
    model_config = {"from_attributes": True}
