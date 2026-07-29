from typing import List
from .base import BaseAnalyzer, AnalysisIssue, Severity, Category

class RadonAnalyzer(BaseAnalyzer):
    @property
    def name(self) -> str:
        return "radon"

    async def analyze(self, file_path: str, content: str) -> List[AnalysisIssue]:
        if not file_path.endswith(".py"):
            return []
        issues = []
        try:
            from radon.complexity import cc_visit
            from radon.metrics import mi_visit

            # Cyclomatic Complexity
            results = cc_visit(content)
            for block in results:
                cc = block.complexity
                if cc > 10:
                    sev = Severity.HIGH
                elif cc > 7:
                    sev = Severity.MEDIUM
                else:
                    continue
                issues.append(AnalysisIssue(
                    file_path=file_path, line_number=block.lineno, column=0,
                    severity=sev, category=Category.COMPLEXITY,
                    tool=self.name, rule_id="CC001",
                    message=f"High cyclomatic complexity in '{block.name}': {cc} (limit: 7)",
                    suggestion="Simplify logic by extracting sub-functions or reducing branches."
                ))

            # Maintainability Index
            mi = mi_visit(content, multi=False)
            if mi < 20:
                issues.append(AnalysisIssue(
                    file_path=file_path, line_number=1, column=0,
                    severity=Severity.HIGH, category=Category.MAINTAINABILITY,
                    tool=self.name, rule_id="MI001",
                    message=f"Very low maintainability index: {mi:.1f} (limit: 20)",
                    suggestion="Simplify the code structure. Reduce complexity and improve documentation."
                ))
            elif mi < 65:
                issues.append(AnalysisIssue(
                    file_path=file_path, line_number=1, column=0,
                    severity=Severity.MEDIUM, category=Category.MAINTAINABILITY,
                    tool=self.name, rule_id="MI002",
                    message=f"Low maintainability index: {mi:.1f} (limit: 65)",
                    suggestion="Consider adding comments, reducing complexity, or splitting the file."
                ))
        except Exception:
            pass
        return issues
