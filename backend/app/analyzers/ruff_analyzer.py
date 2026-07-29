import asyncio
import json
import tempfile
from pathlib import Path
from typing import List
from .base import BaseAnalyzer, AnalysisIssue, Severity, Category

SEVERITY_MAP = {
    "E": Severity.MEDIUM, "W": Severity.LOW, "F": Severity.HIGH,
    "C": Severity.MEDIUM, "N": Severity.LOW, "B": Severity.HIGH, "S": Severity.HIGH,
}
CATEGORY_MAP = {
    "E": Category.STYLE, "W": Category.STYLE, "F": Category.BUG,
    "C": Category.COMPLEXITY, "N": Category.READABILITY, "B": Category.BUG, "S": Category.SECURITY,
}

class RuffAnalyzer(BaseAnalyzer):
    @property
    def name(self) -> str:
        return "ruff"

    async def analyze(self, file_path: str, content: str) -> List[AnalysisIssue]:
        if not file_path.endswith(".py"):
            return []
        issues = []
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(content)
            tmp = f.name
        try:
            proc = await asyncio.create_subprocess_exec(
                "ruff", "check", "--output-format=json", tmp,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            if stdout:
                for item in json.loads(stdout.decode()):
                    code = item.get("code", "E000")
                    prefix = code[0] if code else "E"
                    issues.append(AnalysisIssue(
                        file_path=file_path,
                        line_number=item["location"]["row"],
                        column=item["location"]["column"],
                        severity=SEVERITY_MAP.get(prefix, Severity.LOW),
                        category=CATEGORY_MAP.get(prefix, Category.STYLE),
                        tool=self.name, rule_id=code,
                        message=item.get("message", ""),
                        suggestion=item.get("fix", {}).get("message", "Review and fix this style issue.") if item.get("fix") else "Review and fix this style issue.",
                        code_snippet=item.get("code", None)
                    ))
        except Exception:
            pass
        finally:
            Path(tmp).unlink(missing_ok=True)
        return issues
