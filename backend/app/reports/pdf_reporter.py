import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_pdf(analysis, issues) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    elements.append(Paragraph(f"AI Code Review Report: {analysis.repo_name}", styles['Title']))
    elements.append(Paragraph(f"Generated on: {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Paragraph(f"Total Files: {analysis.total_files} | Total Lines: {analysis.total_lines}", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Summary
    if analysis.ai_review and analysis.ai_review.get("summary"):
        elements.append(Paragraph("Executive Summary", styles['Heading2']))
        elements.append(Paragraph(analysis.ai_review.get("summary"), styles['Normal']))
        elements.append(Spacer(1, 20))

    # Scores Table
    elements.append(Paragraph("Scores", styles['Heading2']))
    scores_data = [
        ["Category", "Score"],
        ["Overall", str(analysis.overall_score)],
        ["Security", str(analysis.security_score)],
        ["Performance", str(analysis.performance_score)],
        ["Maintainability", str(analysis.maintainability_score)],
        ["Readability", str(analysis.readability_score)],
        ["Architecture", str(analysis.architecture_score)],
        ["Complexity", str(analysis.complexity_score)]
    ]
    t_scores = Table(scores_data, colWidths=[200, 100])
    t_scores.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(t_scores)
    elements.append(Spacer(1, 20))

    # Issues Table
    elements.append(Paragraph(f"Issues ({len(issues)})", styles['Heading2']))
    if issues:
        issues_data = [["File", "Line", "Severity", "Message"]]
        for issue in issues[:100]: # limit to first 100 for PDF to avoid huge files
            file_name = issue.file_path.split("/")[-1] if "/" in issue.file_path else (issue.file_path.split("\\")[-1] if "\\" in issue.file_path else issue.file_path)
            # truncate message if too long
            msg = issue.message[:50] + "..." if len(issue.message) > 50 else issue.message
            issues_data.append([file_name, str(issue.line_number), issue.severity, msg])
        
        t_issues = Table(issues_data, colWidths=[150, 50, 80, 200])
        t_issues.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('WORDWRAP', (0, 0), (-1, -1), True)
        ]))
        elements.append(t_issues)
        if len(issues) > 100:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(f"...and {len(issues) - 100} more issues not shown in PDF.", styles['Normal']))

    doc.build(elements)
    return buffer.getvalue()
