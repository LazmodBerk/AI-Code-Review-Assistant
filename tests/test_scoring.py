import sys
sys.path.insert(0, 'backend')
from app.scoring.engine import compute_scores
from app.analyzers.base import AnalysisIssue, Severity, Category

def make_issue(sev, cat):
    return AnalysisIssue('test.py', 1, 0, sev, cat, 'test', 'T001', 'msg', 'suggestion')

def test_perfect_score():
    scores = compute_scores([])
    assert scores['overall'] == 100.0
    assert scores['security'] == 100.0

def test_critical_security_lowers_score():
    issues = [make_issue(Severity.CRITICAL, Category.SECURITY)] * 4
    scores = compute_scores(issues)
    assert scores['security'] == 0.0
    assert scores['overall'] < 100.0

def test_score_bounds():
    issues = [make_issue(Severity.CRITICAL, Category.SECURITY)] * 100
    scores = compute_scores(issues)
    for v in scores.values():
        assert 0.0 <= v <= 100.0

def test_overall_is_weighted():
    # With some issues, overall should be below 100
    issues = [make_issue(Severity.HIGH, Category.MAINTAINABILITY)] * 5
    scores = compute_scores(issues)
    assert scores['overall'] < 100.0
    assert scores['maintainability'] < 100.0
