export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category = 'security' | 'performance' | 'maintainability' | 'readability' | 'complexity' | 'style' | 'bug';
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Issue {
  id: string;
  file_path: string;
  line_number: number;
  column: number;
  severity: Severity;
  category: Category;
  tool: string;
  rule_id: string;
  message: string;
  suggestion: string;
  code_snippet?: string;
}

export interface Scores {
  overall: number;
  security: number;
  performance: number;
  maintainability: number;
  readability: number;
  architecture: number;
  complexity: number;
}

export interface ReviewItem {
  issue: string;
  suggestion: string;
  severity: string;
}

export interface AIReview {
  summary: string;
  bugs: ReviewItem[];
  performance: ReviewItem[];
  security: ReviewItem[];
  readability: ReviewItem[];
  maintainability: ReviewItem[];
  solid_violations: ReviewItem[];
  design_patterns: ReviewItem[];
  scalability: ReviewItem[];
}

export interface AnalysisResult {
  id: string;
  repo_name: string;
  repo_url?: string;
  status: AnalysisStatus;
  created_at: string;
  total_files: number;
  total_lines: number;
  language_breakdown?: Record<string, number>;
  scores: Scores;
  issues: Issue[];
  ai_review?: AIReview;
  error_message?: string;
}

export interface HistoryItem {
  id: string;
  repo_name: string;
  status: AnalysisStatus;
  created_at: string;
  overall_score: number;
  total_files: number;
  total_issues: number;
}
