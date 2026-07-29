import asyncio
import json
import tempfile
from pathlib import Path
from typing import List
from .base import BaseAnalyzer, AnalysisIssue, Severity, Category

SEV_MAP = {"HIGH": Severity.HIGH, "MEDIUM": Severity.MEDIUM, "LOW": Severity.LOW}

class BanditAnalyzer(BaseAnalyzer):
    @property
    def name(self) -> str:
        return "bandit"

    async def analyze(self, file_path: str, content: str) -> List[AnalysisIssue]:
        if not file_path.endswith(".py"):
            return []
        issues = []
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            tmp = f.name
        try:
            proc = await asyncio.create_subprocess_exec(
                "bandit", "-f", "json", "-q", tmp,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            if stdout:
                data = json.loads(stdout.decode())
                for r in data.get("results", []):
                    issues.append(AnalysisIssue(
                        file_path=file_path,
                        line_number=r.get("line_number", 0),
                        column=r.get("col_offset", 0),
                        severity=SEV_MAP.get(r.get("issue_severity", "LOW"), Severity.LOW),
                        category=Category.SECURITY,
                        tool=self.name, rule_id=r.get("test_id", "B000"),
                        message=r.get("issue_text", ""),
                        suggestion=r.get("more_info", "Review this security concern."),
                        code_snippet=r.get("code", None)
                    ))
        except Exception:
            pass
        finally:
            Path(tmp).unlink(missing_ok=True)
        return issues
