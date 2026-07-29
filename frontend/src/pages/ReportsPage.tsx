import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { HistoryItem } from '../types';
import { Link } from 'react-router-dom';
import { Trash2, FileText, Search, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ReportsPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      toast.error('Failed to load reports');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;
    try {
      await api.deleteAnalysis(id);
      toast.success('Report deleted');
      setHistory(history.filter(h => h.id !== id));
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleDownload = async (id: string, repoName: string) => {
    try {
      const blob = await api.downloadReport(id, 'pdf');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${repoName}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download PDF report');
    }
  };

  const filteredHistory = history.filter(h => 
    h.repo_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      className="pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary text-gradient">History</h1>
          <p className="text-text-muted mt-1">View past analysis runs and export data</p>
        </div>
        <Link to="/upload">
          <Button variant="primary">New Analysis</Button>
        </Link>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden p-0">
          <div className="p-4 border-b border-border-color bg-surface-color/50">
            <div className="relative max-w-sm flex items-center">
              <Search className="absolute left-3 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search repositories..."
                className="input w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Repository</th>
                  <th>Date</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Issues</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <div className="flex flex-col gap-4">
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                        <Skeleton height="2.5rem" />
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-text-muted">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No reports found</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <motion.tr 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-surface-color/50 transition-colors"
                    >
                      <td className="font-medium text-text-primary">
                        <Link to={`/analysis/${item.id}/results`} className="hover:text-primary-color transition-colors">
                          {item.repo_name}
                        </Link>
                      </td>
                      <td className="text-text-muted text-sm whitespace-nowrap">
                        {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="text-center">
                        <span className={`font-bold text-lg ${item.overall_score >= 70 ? 'text-success-color' : item.overall_score >= 40 ? 'text-warning-color' : 'text-danger-color'}`}>
                          {item.overall_score}
                        </span>
                      </td>
                      <td className="text-center font-mono text-sm">{item.total_issues}</td>
                      <td>
                        <Badge variant={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'danger' : 'info'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'completed' && (
                            <Button variant="ghost" className="px-2" onClick={() => handleDownload(item.id, item.repo_name)} title="Download PDF">
                              <Download size={18} />
                            </Button>
                          )}
                          <Link to={`/analysis/${item.id}/${item.status === 'completed' ? 'results' : 'progress'}`}>
                            <Button variant="ghost" className="px-2" title="View Details">
                              <ExternalLink size={18} />
                            </Button>
                          </Link>
                          <Button variant="ghost" className="px-2 text-danger-color hover:text-danger-color" onClick={() => handleDelete(item.id)} title="Delete">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
