from typing import List, Dict
from app.analyzers.base import AnalysisIssue, Severity, Category

def compute_scores(issues: List[AnalysisIssue], ai_score_adjustment: int = 0) -> Dict[str, float]:
    """Compute weighted scores 0-100 across 7 dimensions."""
    def count_by(items, **kwargs):
        return sum(1 for i in items if all(getattr(i, k) == v for k, v in kwargs.items()))

    # Security score
    sec_issues = [i for i in issues if i.category == Category.SECURITY]
    sec_penalty = (
        count_by(sec_issues, severity=Severity.CRITICAL) * 25 +
        count_by(sec_issues, severity=Severity.HIGH) * 15 +
        count_by(sec_issues, severity=Severity.MEDIUM) * 8 +
        count_by(sec_issues, severity=Severity.LOW) * 3
    )
    security = max(0.0, min(100.0, 100.0 - sec_penalty))

    # Complexity score (from radon)
    comp_issues = [i for i in issues if i.category == Category.COMPLEXITY]
    comp_penalty = count_by(comp_issues, severity=Severity.HIGH) * 10 + count_by(comp_issues, severity=Severity.MEDIUM) * 5
    complexity = max(0.0, min(100.0, 100.0 - comp_penalty))

    # Maintainability
    maint_issues = [i for i in issues if i.category == Category.MAINTAINABILITY]
    maint_penalty = (
        count_by(maint_issues, severity=Severity.HIGH) * 12 +
        count_by(maint_issues, severity=Severity.MEDIUM) * 6 +
        count_by(maint_issues, severity=Severity.LOW) * 2
    )
    maintainability = max(0.0, min(100.0, 100.0 - maint_penalty))

    # Readability
    read_issues = [i for i in issues if i.category == Category.READABILITY]
    read_penalty = count_by(read_issues, severity=Severity.HIGH) * 10 + count_by(read_issues, severity=Severity.MEDIUM) * 5 + count_by(read_issues, severity=Severity.LOW) * 2
    readability = max(0.0, min(100.0, 100.0 - read_penalty))

    # Performance
    perf_issues = [i for i in issues if i.category == Category.PERFORMANCE]
    perf_penalty = count_by(perf_issues, severity=Severity.HIGH) * 12 + count_by(perf_issues, severity=Severity.MEDIUM) * 6
    performance = max(0.0, min(100.0, 100.0 - perf_penalty))

    # Architecture (AI-driven + structural)
    bug_issues = [i for i in issues if i.category == Category.BUG]
    arch_penalty = count_by(bug_issues, severity=Severity.CRITICAL) * 15 + count_by(bug_issues, severity=Severity.HIGH) * 8
    architecture = max(0.0, min(100.0, 100.0 - arch_penalty + ai_score_adjustment))

    # Weighted overall
    overall = (
        security * 0.25 +
        performance * 0.15 +
        maintainability * 0.20 +
        readability * 0.15 +
        architecture * 0.15 +
        complexity * 0.10
    )

    return {
        "overall": round(overall, 1),
        "security": round(security, 1),
        "performance": round(performance, 1),
        "maintainability": round(maintainability, 1),
        "readability": round(readability, 1),
        "architecture": round(architecture, 1),
        "complexity": round(complexity, 1),
    }
