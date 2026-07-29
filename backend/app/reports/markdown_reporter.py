def generate_markdown(analysis, issues) -> str:
    md = f"# AI Code Review Report: {analysis.repo_name}\n\n"
    md += f"**Date:** {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n"
    md += f"**Total Files:** {analysis.total_files}\n"
    md += f"**Total Lines:** {analysis.total_lines}\n\n"

    if analysis.ai_review and analysis.ai_review.get("summary"):
        md += "## Executive Summary\n\n"
        md += f"{analysis.ai_review.get('summary')}\n\n"

    md += "## Scores\n\n"
    md += "| Category | Score |\n"
    md += "| --- | --- |\n"
    md += f"| Overall | **{analysis.overall_score}** |\n"
    md += f"| Security | {analysis.security_score} |\n"
    md += f"| Performance | {analysis.performance_score} |\n"
    md += f"| Maintainability | {analysis.maintainability_score} |\n"
    md += f"| Readability | {analysis.readability_score} |\n"
    md += f"| Architecture | {analysis.architecture_score} |\n"
    md += f"| Complexity | {analysis.complexity_score} |\n\n"

    md += f"## Issues ({len(issues)})\n\n"
    if issues:
        md += "| File | Line | Severity | Category | Message | Tool |\n"
        md += "| --- | --- | --- | --- | --- | --- |\n"
        for issue in issues:
            file_name = issue.file_path.split("/")[-1] if "/" in issue.file_path else (issue.file_path.split("\\")[-1] if "\\" in issue.file_path else issue.file_path)
            md += f"| {file_name} | {issue.line_number} | {issue.severity} | {issue.category} | {issue.message.replace('|', '/')} | {issue.tool} |\n"
    else:
        md += "No issues found!\n"

    return md
