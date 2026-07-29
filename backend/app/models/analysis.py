import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class IssueSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class IssueCategory(str, enum.Enum):
    SECURITY = "security"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    READABILITY = "readability"
    COMPLEXITY = "complexity"
    STYLE = "style"
    BUG = "bug"

class Analysis(Base):
    __tablename__ = "analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    repo_name: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(SAEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    total_files: Mapped[int] = mapped_column(Integer, default=0)
    total_lines: Mapped[int] = mapped_column(Integer, default=0)
    language_breakdown: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    security_score: Mapped[float] = mapped_column(Float, default=0.0)
    performance_score: Mapped[float] = mapped_column(Float, default=0.0)
    maintainability_score: Mapped[float] = mapped_column(Float, default=0.0)
    readability_score: Mapped[float] = mapped_column(Float, default=0.0)
    architecture_score: Mapped[float] = mapped_column(Float, default=0.0)
    complexity_score: Mapped[float] = mapped_column(Float, default=0.0)
    ai_review: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    issues: Mapped[list["Issue"]] = relationship("Issue", back_populates="analysis", cascade="all, delete-orphan")
    files: Mapped[list["AnalysisFile"]] = relationship("AnalysisFile", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisFile(Base):
    __tablename__ = "analysis_files"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analyses.id"))
    file_path: Mapped[str] = mapped_column(String(500))
    language: Mapped[str] = mapped_column(String(50), default="unknown")
    lines: Mapped[int] = mapped_column(Integer, default=0)
    issues_count: Mapped[int] = mapped_column(Integer, default=0)
    complexity_score: Mapped[float] = mapped_column(Float, default=0.0)
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="files")

class Issue(Base):
    __tablename__ = "issues"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analyses.id"))
    file_path: Mapped[str] = mapped_column(String(500))
    line_number: Mapped[int] = mapped_column(Integer, default=0)
    column: Mapped[int] = mapped_column(Integer, default=0)
    severity: Mapped[str] = mapped_column(SAEnum(IssueSeverity))
    category: Mapped[str] = mapped_column(SAEnum(IssueCategory))
    tool: Mapped[str] = mapped_column(String(50))
    rule_id: Mapped[str] = mapped_column(String(100))
    message: Mapped[str] = mapped_column(Text)
    suggestion: Mapped[str] = mapped_column(Text, default="")
    code_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="issues")
