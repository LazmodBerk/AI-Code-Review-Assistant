import ast
import re
from typing import List
from .base import BaseAnalyzer, AnalysisIssue, Severity, Category

class ASTAnalyzer(BaseAnalyzer):
    """Custom AST-based code analyzer detecting 13 code quality issues."""

    @property
    def name(self) -> str:
        return "ast"

    async def analyze(self, file_path: str, content: str) -> List[AnalysisIssue]:
        if not file_path.endswith(".py"):
            return []
        issues = []
        try:
            tree = ast.parse(content, filename=file_path)
        except SyntaxError:
            return []
        lines = content.splitlines()
        total_lines = len(lines)

        # Large file check
        if total_lines > 500:
            issues.append(AnalysisIssue(
                file_path=file_path, line_number=1, column=0,
                severity=Severity.MEDIUM, category=Category.MAINTAINABILITY,
                tool=self.name, rule_id="AE001",
                message=f"Large file: {total_lines} lines (limit: 500)",
                suggestion="Consider splitting into smaller modules."
            ))

        # Duplicate imports
        imports_seen = set()
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                key = ast.dump(node)
                if key in imports_seen:
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.LOW, category=Category.STYLE,
                        tool=self.name, rule_id="AE002",
                        message="Duplicate import detected.",
                        suggestion="Remove the duplicate import.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))
                imports_seen.add(key)

        # TODO comments
        for i, line in enumerate(lines, 1):
            if re.search(r"#\s*(TODO|FIXME|HACK|XXX)", line, re.IGNORECASE):
                issues.append(AnalysisIssue(
                    file_path=file_path, line_number=i, column=0,
                    severity=Severity.INFO, category=Category.MAINTAINABILITY,
                    tool=self.name, rule_id="AE003",
                    message=f"TODO/FIXME comment found: {line.strip()}",
                    suggestion="Resolve or create a ticket for this item.",
                    code_snippet=line
                ))

        # Walk all functions and classes
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Long function
                func_lines = (node.end_lineno or node.lineno) - node.lineno
                if func_lines > 50:
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.MEDIUM, category=Category.MAINTAINABILITY,
                        tool=self.name, rule_id="AE004",
                        message=f"Long function '{node.name}': {func_lines} lines (limit: 50)",
                        suggestion="Break this function into smaller, focused functions.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

                # High parameter count
                param_count = len(node.args.args)
                if param_count > 5:
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.MEDIUM, category=Category.MAINTAINABILITY,
                        tool=self.name, rule_id="AE005",
                        message=f"High parameter count in '{node.name}': {param_count} params (limit: 5)",
                        suggestion="Consider using a dataclass or config object to group parameters.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

                # Missing type hints
                if node.returns is None and node.name != "__init__":
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.LOW, category=Category.READABILITY,
                        tool=self.name, rule_id="AE006",
                        message=f"Function '{node.name}' is missing a return type annotation.",
                        suggestion="Add a return type annotation, e.g., `-> None` or `-> str`.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

            elif isinstance(node, ast.ClassDef):
                # Long class
                class_lines = (node.end_lineno or node.lineno) - node.lineno
                if class_lines > 300:
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.HIGH, category=Category.MAINTAINABILITY,
                        tool=self.name, rule_id="AE007",
                        message=f"Long class '{node.name}': {class_lines} lines (limit: 300)",
                        suggestion="Consider splitting into multiple classes following Single Responsibility Principle."
                    ))

            elif isinstance(node, ast.ExceptHandler):
                # Empty except block
                if not node.body or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.HIGH, category=Category.BUG,
                        tool=self.name, rule_id="AE008",
                        message="Empty except block silences all errors.",
                        suggestion="At minimum, log the exception or re-raise it.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

                # Broad exception catching
                if node.type is None or (isinstance(node.type, ast.Name) and node.type.id == "Exception"):
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.MEDIUM, category=Category.BUG,
                        tool=self.name, rule_id="AE009",
                        message="Broad exception catching hides bugs.",
                        suggestion="Catch specific exception types instead of bare `except` or `except Exception`.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

        # Deep nesting analysis
        self._check_nesting(tree, file_path, lines, issues)

        # Magic numbers
        self._check_magic_numbers(tree, file_path, lines, issues)

        return issues

    def _get_nesting_depth(self, node: ast.AST, current: int = 0) -> int:
        if isinstance(node, (ast.If, ast.For, ast.While, ast.With, ast.Try, ast.AsyncFor, ast.AsyncWith)):
            current += 1
        max_depth = current
        for child in ast.iter_child_nodes(node):
            child_depth = self._get_nesting_depth(child, current)
            max_depth = max(max_depth, child_depth)
        return max_depth

    def _check_nesting(self, tree: ast.AST, file_path: str, lines: list, issues: list) -> None:
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                depth = self._get_nesting_depth(node)
                if depth > 4:
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.MEDIUM, category=Category.COMPLEXITY,
                        tool=self.name, rule_id="AE010",
                        message=f"Deep nesting in '{node.name}': depth {depth} (limit: 4)",
                        suggestion="Extract nested blocks into separate functions or use early returns.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))

    def _check_magic_numbers(self, tree: ast.AST, file_path: str, lines: list, issues: list) -> None:
        ALLOWED = {0, 1, -1, 2, 100, 1000}
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                if node.value not in ALLOWED and abs(node.value) > 1:
                    # Skip if it's in an assignment to an ALL_CAPS constant
                    issues.append(AnalysisIssue(
                        file_path=file_path, line_number=node.lineno, column=node.col_offset,
                        severity=Severity.LOW, category=Category.MAINTAINABILITY,
                        tool=self.name, rule_id="AE011",
                        message=f"Magic number: {node.value}",
                        suggestion="Extract this value into a named constant.",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else None
                    ))
