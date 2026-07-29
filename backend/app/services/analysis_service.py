import asyncio
import io
import os
import shutil
import uuid
import zipfile
from pathlib import Path
from typing import List, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.analysis import Analysis, AnalysisFile, Issue, AnalysisStatus
from app.analyzers.ast_analyzer import ASTAnalyzer
from app.analyzers.ruff_analyzer import RuffAnalyzer
from app.analyzers.bandit_analyzer import BanditAnalyzer
from app.analyzers.radon_analyzer import RadonAnalyzer
from app.analyzers.base import AnalysisIssue
from app.ai.factory import get_llm_provider
from app.scoring.engine import compute_scores

logger = get_logger("service")

EXT_LANG = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript",
    ".jsx": "JavaScript", ".go": "Go", ".rs": "Rust", ".java": "Java",
    ".cpp": "C++", ".c": "C", ".cs": "C#", ".rb": "Ruby", ".php": "PHP",
    ".kt": "Kotlin", ".swift": "Swift",
}

SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build", ".next"}

async def run_analysis(analysis_id: str, file_paths: List[Path], db: AsyncSession, progress_cb=None) -> None:
    """Run all analyzers and save results."""
    settings = get_settings()
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    if not analysis:
        return

    analysis.status = AnalysisStatus.RUNNING
    await db.commit()

    all_issues: List[AnalysisIssue] = []
    lang_breakdown: dict = {}
    total_lines = 0
    analyzers = [ASTAnalyzer(), RuffAnalyzer(), BanditAnalyzer(), RadonAnalyzer()]

    for idx, fp in enumerate(file_paths):
        if progress_cb:
            await progress_cb({"stage": "analyzing", "progress": int((idx / len(file_paths)) * 60), "message": f"Analyzing {fp.name}"})
        try:
            content = fp.read_text(encoding="utf-8", errors="ignore")
            ext = fp.suffix.lower()
            lang = EXT_LANG.get(ext, "Other")
            lang_breakdown[lang] = lang_breakdown.get(lang, 0) + 1
            lines = len(content.splitlines())
            total_lines += lines
            file_issues = []
            for analyzer in analyzers:
                try:
                    file_issues.extend(await analyzer.analyze(str(fp), content))
                except Exception as e:
                    logger.warning(f"{analyzer.name} failed on {fp}: {e}")
            all_issues.extend(file_issues)
            af = AnalysisFile(analysis_id=analysis_id, file_path=str(fp), language=lang, lines=lines, issues_count=len(file_issues))
            db.add(af)
        except Exception as e:
            logger.warning(f"Could not analyze {fp}: {e}")

    if progress_cb:
        await progress_cb({"stage": "ai_review", "progress": 70, "message": "Running AI review..."})

    # AI review on largest file
    ai_result = None
    ai_review_dict = None
    if file_paths:
        largest = max(file_paths, key=lambda p: p.stat().st_size, default=None)
        if largest:
            try:
                provider = get_llm_provider()
                ai_result = await provider.review_code(str(largest), largest.read_text(encoding="utf-8", errors="ignore"))
                if ai_result:
                    from dataclasses import asdict
                    ai_review_dict = {
                        k: [vars(item) for item in v] if isinstance(v, list) else v
                        for k, v in vars(ai_result).items()
                    }
            except Exception as e:
                logger.warning(f"AI review failed: {e}")

    if progress_cb:
        await progress_cb({"stage": "scoring", "progress": 85, "message": "Computing scores..."})

    scores = compute_scores(all_issues, ai_score_adjustment=ai_result.score_adjustment if ai_result else 0)

    # Persist issues
    for issue in all_issues:
        db_issue = Issue(
            analysis_id=analysis_id,
            file_path=issue.file_path,
            line_number=issue.line_number,
            column=issue.column,
            severity=issue.severity.value,
            category=issue.category.value,
            tool=issue.tool,
            rule_id=issue.rule_id,
            message=issue.message,
            suggestion=issue.suggestion,
            code_snippet=issue.code_snippet,
        )
        db.add(db_issue)

    analysis.status = AnalysisStatus.COMPLETED
    analysis.total_files = len(file_paths)
    analysis.total_lines = total_lines
    analysis.language_breakdown = lang_breakdown
    analysis.overall_score = scores["overall"]
    analysis.security_score = scores["security"]
    analysis.performance_score = scores["performance"]
    analysis.maintainability_score = scores["maintainability"]
    analysis.readability_score = scores["readability"]
    analysis.architecture_score = scores["architecture"]
    analysis.complexity_score = scores["complexity"]
    analysis.ai_review = ai_review_dict
    await db.commit()

    if progress_cb:
        await progress_cb({"stage": "complete", "progress": 100, "message": "Analysis complete!"})

async def collect_files(base_path: Path) -> List[Path]:
    """Collect all analyzable files from a directory."""
    settings = get_settings()
    files = []
    for fp in base_path.rglob("*"):
        if any(skip in fp.parts for skip in SKIP_DIRS):
            continue
        if fp.is_file() and fp.suffix.lower() in EXT_LANG and fp.stat().st_size < settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            files.append(fp)
    return files[:settings.MAX_FILES_PER_ANALYSIS]

async def download_github_repo(url: str, dest: Path) -> Path:
    """Download and extract a GitHub repo as ZIP."""
    # Convert https://github.com/user/repo to zip download URL
    parts = url.rstrip("/").replace("https://github.com/", "").split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL")
    zip_url = f"https://github.com/{parts[0]}/{parts[1]}/archive/refs/heads/main.zip"
    dest.mkdir(parents=True, exist_ok=True)
    zip_path = dest / "repo.zip"
    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        r = await client.get(zip_url)
        if r.status_code != 200:
            zip_url = zip_url.replace("/main.zip", "/master.zip")
            r = await client.get(zip_url)
            if r.status_code != 200:
                raise Exception(f"Failed to download repo: {r.status_code}")
        zip_path.write_bytes(r.content)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(dest)
    zip_path.unlink(missing_ok=True)
    subdirs = [d for d in dest.iterdir() if d.is_dir()]
    return subdirs[0] if subdirs else dest
