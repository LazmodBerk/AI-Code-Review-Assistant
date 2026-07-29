import asyncio
import json
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.responses import HTMLResponse, Response, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db, AsyncSessionLocal
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.analysis import Analysis, Issue, AnalysisStatus
from app.schemas.analysis import AnalysisCreateResponse, AnalysisResult, MetricsResponse, HistoryItem, ScoresSchema, IssueSchema
from app.services.analysis_service import run_analysis, collect_files, download_github_repo

router = APIRouter()
logger = get_logger("router")

# Store active WebSocket connections: analysis_id -> list of websockets
_ws_connections: dict = {}

async def broadcast(analysis_id: str, msg: dict):
    for ws in _ws_connections.get(analysis_id, []):
        try:
            await ws.send_json(msg)
        except Exception:
            pass

async def _run_and_notify(analysis_id: str, file_paths: list):
    async with AsyncSessionLocal() as db:
        async def progress(msg):
            await broadcast(analysis_id, msg)
        try:
            await run_analysis(analysis_id, file_paths, db, progress_cb=progress)
        except Exception as e:
            logger.error(f"Analysis {analysis_id} failed: {e}")
            result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
            analysis = result.scalar_one_or_none()
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                await db.commit()
        finally:
            await broadcast(analysis_id, {"stage": "done", "progress": 100})

@router.get("/health")
async def health():
    from app.core.config import get_settings
    s = get_settings()
    return {"status": "ok", "version": s.VERSION, "app": s.APP_NAME}

@router.post("/analyze", response_model=AnalysisCreateResponse)
async def analyze(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    files: Optional[List[UploadFile]] = File(default=None),
    github_url: Optional[str] = Form(default=None),
    repo_name: str = Form(default="My Repository"),
):
    settings = get_settings()
    analysis_id = str(uuid.uuid4())
    analysis = Analysis(id=analysis_id, repo_name=repo_name, repo_url=github_url, status=AnalysisStatus.PENDING)
    db.add(analysis)
    await db.commit()

    upload_dir = Path(settings.UPLOAD_DIR) / analysis_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_paths = []

    if github_url:
        try:
            repo_path = await download_github_repo(github_url, upload_dir)
            file_paths = await collect_files(repo_path)
        except Exception as e:
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            await db.commit()
            raise HTTPException(400, str(e))
    elif files:
        for uf in files:
            if uf.filename:
                dest = upload_dir / uf.filename
                dest.parent.mkdir(parents=True, exist_ok=True)
                content = await uf.read()
                if uf.filename.endswith(".zip"):
                    import zipfile, io
                    with zipfile.ZipFile(io.BytesIO(content)) as z:
                        z.extractall(upload_dir)
                    file_paths = await collect_files(upload_dir)
                else:
                    dest.write_bytes(content)
                    file_paths.append(dest)
    else:
        raise HTTPException(400, "Provide files or github_url")

    background_tasks.add_task(_run_and_notify, analysis_id, file_paths)
    return AnalysisCreateResponse(analysis_id=analysis_id, status="pending")

@router.get("/results/{analysis_id}", response_model=AnalysisResult)
async def get_results(analysis_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    issues_result = await db.execute(select(Issue).where(Issue.analysis_id == analysis_id))
    issues = issues_result.scalars().all()
    return AnalysisResult(
        id=analysis.id, repo_name=analysis.repo_name, repo_url=analysis.repo_url,
        status=analysis.status, created_at=analysis.created_at,
        total_files=analysis.total_files, total_lines=analysis.total_lines,
        language_breakdown=analysis.language_breakdown,
        scores=ScoresSchema(
            overall=analysis.overall_score, security=analysis.security_score,
            performance=analysis.performance_score, maintainability=analysis.maintainability_score,
            readability=analysis.readability_score, architecture=analysis.architecture_score,
            complexity=analysis.complexity_score
        ),
        issues=[IssueSchema.model_validate(i) for i in issues],
        ai_review=analysis.ai_review, error_message=analysis.error_message
    )

@router.get("/metrics/{analysis_id}", response_model=MetricsResponse)
async def get_metrics(analysis_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    issues_result = await db.execute(select(Issue).where(Issue.analysis_id == analysis_id))
    issues = issues_result.scalars().all()
    by_sev = {}
    by_cat = {}
    for i in issues:
        by_sev[i.severity] = by_sev.get(i.severity, 0) + 1
        by_cat[i.category] = by_cat.get(i.category, 0) + 1
    return MetricsResponse(
        scores=ScoresSchema(
            overall=analysis.overall_score, security=analysis.security_score,
            performance=analysis.performance_score, maintainability=analysis.maintainability_score,
            readability=analysis.readability_score, architecture=analysis.architecture_score,
            complexity=analysis.complexity_score
        ),
        total_files=analysis.total_files, total_lines=analysis.total_lines,
        total_issues=len(issues), issues_by_severity=by_sev,
        issues_by_category=by_cat, language_breakdown=analysis.language_breakdown
    )

@router.get("/report/{analysis_id}")
async def get_report(analysis_id: str, format: str = "html", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    issues_result = await db.execute(select(Issue).where(Issue.analysis_id == analysis_id))
    issues = issues_result.scalars().all()
    if format == "html":
        from app.reports.html_reporter import generate_html
        content = generate_html(analysis, issues)
        return HTMLResponse(content=content)
    elif format == "markdown":
        from app.reports.markdown_reporter import generate_markdown
        content = generate_markdown(analysis, issues)
        return Response(content=content, media_type="text/markdown", headers={"Content-Disposition": f'attachment; filename="report_{analysis_id}.md"'})
    elif format == "pdf":
        from app.reports.pdf_reporter import generate_pdf
        pdf_bytes = generate_pdf(analysis, issues)
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="report_{analysis_id}.pdf"'})
    raise HTTPException(400, "Invalid format. Use: html, markdown, pdf")

@router.get("/history", response_model=List[HistoryItem])
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).order_by(Analysis.created_at.desc()))
    analyses = result.scalars().all()
    items = []
    for a in analyses:
        count_result = await db.execute(select(func.count(Issue.id)).where(Issue.analysis_id == a.id))
        count = count_result.scalar() or 0
        items.append(HistoryItem(id=a.id, repo_name=a.repo_name, status=a.status,
            created_at=a.created_at, overall_score=a.overall_score, total_files=a.total_files, total_issues=count))
    return items

@router.delete("/analysis/{analysis_id}", status_code=204)
async def delete_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    await db.delete(analysis)
    await db.commit()
    upload_dir = Path(get_settings().UPLOAD_DIR) / analysis_id
    if upload_dir.exists():
        shutil.rmtree(upload_dir, ignore_errors=True)

@router.websocket("/ws/{analysis_id}")
async def websocket_endpoint(websocket: WebSocket, analysis_id: str):
    await websocket.accept()
    _ws_connections.setdefault(analysis_id, []).append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        _ws_connections.get(analysis_id, []).remove(websocket)
