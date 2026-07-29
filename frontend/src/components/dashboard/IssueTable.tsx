import React, { useState, useMemo } from 'react';
import { Issue } from '../../types';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface IssueTableProps {
  issues: Issue[];
}

const ITEMS_PER_PAGE = 20;

export default function IssueTable({ issues }: IssueTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = issue.file_path.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            issue.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [issues, searchTerm, severityFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = ['File', 'Line', 'Severity', 'Category', 'Message', 'Tool'];
    const rows = filteredIssues.map(i => [i.file_path, i.line_number, i.severity, i.category, `"${i.message.replace(/"/g, '""')}"`, i.tool]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'issues_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(filteredIssues, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'issues_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <Card className="mt-8 overflow-hidden p-0">
      <div className="p-4 border-b border-border-color flex flex-col sm:flex-row gap-4 justify-between items-center bg-transparent">
        <h3 className="text-lg font-bold text-text-primary">Detailed Issues</h3>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search file or message..."
              className="input pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="select bg-bg-color text-text-primary border border-border-color py-1 px-2 rounded-md focus:outline-none focus:border-primary-color"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all" className="bg-bg-color text-text-primary">All Severities</option>
            <option value="critical" className="bg-bg-color text-text-primary">Critical</option>
            <option value="high" className="bg-bg-color text-text-primary">High</option>
            <option value="medium" className="bg-bg-color text-text-primary">Medium</option>
            <option value="low" className="bg-bg-color text-text-primary">Low</option>
            <option value="info" className="bg-bg-color text-text-primary">Info</option>
          </select>
          
          <select
            className="select bg-bg-color text-text-primary border border-border-color py-1 px-2 rounded-md focus:outline-none focus:border-primary-color"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all" className="bg-bg-color text-text-primary">All Categories</option>
            <option value="security" className="bg-bg-color text-text-primary">Security</option>
            <option value="bug" className="bg-bg-color text-text-primary">Bug</option>
            <option value="performance" className="bg-bg-color text-text-primary">Performance</option>
            <option value="maintainability" className="bg-bg-color text-text-primary">Maintainability</option>
            <option value="style" className="bg-bg-color text-text-primary">Style</option>
          </select>

          <Button variant="secondary" onClick={handleExportCSV} className="text-sm px-3">
            <Download size={16} /> CSV
          </Button>
          <Button variant="secondary" onClick={handleExportJSON} className="text-sm px-3">
            <Download size={16} /> JSON
          </Button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Line</th>
              <th>Severity</th>
              <th>Category</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {paginatedIssues.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  No issues found matching the criteria.
                </td>
              </tr>
            ) : (
              paginatedIssues.map((issue) => (
                <tr key={issue.id}>
                  <td className="font-mono text-xs break-all max-w-[200px]" title={issue.file_path}>
                    {issue.file_path}
                  </td>
                  <td className="font-mono text-xs text-text-muted">{issue.line_number}</td>
                  <td>
                    <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </td>
                  <td className="capitalize">{issue.category}</td>
                  <td className="max-w-md">
                    <p className="truncate" title={issue.message}>{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-text-muted mt-1 truncate" title={issue.suggestion}>
                        <span className="font-semibold text-text-primary">Fix: </span>{issue.suggestion}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border-color flex justify-between items-center bg-transparent">
          <span className="text-sm text-text-muted">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredIssues.length)} of {filteredIssues.length} issues
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
