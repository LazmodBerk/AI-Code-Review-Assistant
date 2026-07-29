def generate_html(analysis, issues) -> str:
    css = """
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1e1e1e; color: #d4d4d4; margin: 0; padding: 20px; }
    h1, h2, h3 { color: #ffffff; }
    .header { border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
    .card-container { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; }
    .card { background-color: #252526; border-radius: 8px; padding: 20px; flex: 1; min-width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-align: center; border: 1px solid #333; }
    .card h3 { margin-top: 0; font-size: 1.1em; color: #cccccc; }
    .score { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
    .score.excellent { color: #4CAF50; }
    .score.good { color: #8BC34A; }
    .score.average { color: #FFEB3B; }
    .score.poor { color: #FF9800; }
    .score.bad { color: #F44336; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #252526; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #333; }
    th { background-color: #2d2d30; color: #ffffff; font-weight: 600; }
    tr:hover { background-color: #2a2d2e; }
    .severity-critical { color: #ff5252; font-weight: bold; }
    .severity-high { color: #ff9800; font-weight: bold; }
    .severity-medium { color: #ffeb3b; }
    .severity-low { color: #4caf50; }
    .severity-info { color: #2196f3; }
    .summary-box { background-color: #252526; border-left: 4px solid #007acc; padding: 15px; margin-bottom: 30px; border-radius: 4px; }
    """

    def get_score_class(score):
        if score >= 90: return "excellent"
        if score >= 80: return "good"
        if score >= 70: return "average"
        if score >= 50: return "poor"
        return "bad"

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Analysis Report - {analysis.repo_name}</title>
        <style>{css}</style>
    </head>
    <body>
        <div class="header">
            <h1>AI Code Review Report: {analysis.repo_name}</h1>
            <p>Generated on: {analysis.created_at.strftime("%Y-%m-%d %H:%M:%S")}</p>
            <p>Total Files: {analysis.total_files} | Total Lines: {analysis.total_lines}</p>
        </div>
    """

    if analysis.ai_review and analysis.ai_review.get("summary"):
        html += f"""
        <div class="summary-box">
            <h2>Executive Summary</h2>
            <p>{analysis.ai_review.get("summary")}</p>
        </div>
        """

    html += f"""
        <h2>Scores</h2>
        <div class="card-container">
            <div class="card"><h3>Overall</h3><div class="score {get_score_class(analysis.overall_score)}">{analysis.overall_score}</div></div>
            <div class="card"><h3>Security</h3><div class="score {get_score_class(analysis.security_score)}">{analysis.security_score}</div></div>
            <div class="card"><h3>Performance</h3><div class="score {get_score_class(analysis.performance_score)}">{analysis.performance_score}</div></div>
            <div class="card"><h3>Maintainability</h3><div class="score {get_score_class(analysis.maintainability_score)}">{analysis.maintainability_score}</div></div>
            <div class="card"><h3>Readability</h3><div class="score {get_score_class(analysis.readability_score)}">{analysis.readability_score}</div></div>
            <div class="card"><h3>Architecture</h3><div class="score {get_score_class(analysis.architecture_score)}">{analysis.architecture_score}</div></div>
            <div class="card"><h3>Complexity</h3><div class="score {get_score_class(analysis.complexity_score)}">{analysis.complexity_score}</div></div>
        </div>
        
        <h2>Issues ({len(issues)})</h2>
        <table>
            <thead>
                <tr>
                    <th>File</th>
                    <th>Line</th>
                    <th>Severity</th>
                    <th>Category</th>
                    <th>Message</th>
                    <th>Tool</th>
                </tr>
            </thead>
            <tbody>
    """

    for issue in issues:
        file_name = issue.file_path.split("/")[-1] if "/" in issue.file_path else (issue.file_path.split("\\")[-1] if "\\" in issue.file_path else issue.file_path)
        html += f"""
                <tr>
                    <td>{file_name}</td>
                    <td>{issue.line_number}</td>
                    <td class="severity-{issue.severity.lower()}">{issue.severity}</td>
                    <td>{issue.category}</td>
                    <td>{issue.message}</td>
                    <td>{issue.tool}</td>
                </tr>
        """

    html += """
            </tbody>
        </table>
    </body>
    </html>
    """
    return html
