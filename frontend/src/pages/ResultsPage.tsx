import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnalysis } from '../hooks/useAnalysis';
import { api } from '../api/client';
import ScoreCard from '../components/dashboard/ScoreCard';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import SeverityPieChart from '../components/dashboard/SeverityPieChart';
import CategoryBarChart from '../components/dashboard/CategoryBarChart';
import LanguageChart from '../components/dashboard/LanguageChart';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import IssueTable from '../components/dashboard/IssueTable';
import { Download, AlertCircle, ArrowLeft, Loader2, FileCode, Zap, Shield, Eye, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
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

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading, error } = useAnalysis(id || '');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-primary-color animate-pulse mb-4" />
        <h2 className="text-xl font-semibold text-text-primary">Analyzing Code...</h2>
      </div>
    );
  }

  if (error || !result) {
    return (
      <Card className="max-w-2xl mx-auto mt-10 text-center p-8">
        <AlertCircle className="w-16 h-16 text-danger-color mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Failed to load results</h2>
        <p className="text-text-muted mb-6">{error?.message || 'Result not found or analysis failed.'}</p>
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
      </Card>
    );
  }

  const handleDownload = async (format: 'pdf' | 'md' | 'html') => {
    try {
      const blob = await api.downloadReport(id!, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${result.repo_name}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <motion.div 
      className="pb-12 relative"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="hero-bg-glow"></div>
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link to="/reports" className="text-sm text-text-muted hover:text-text-primary mb-2 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
          </Link>
          <h1 className="text-3xl font-bold text-text-primary flex items-center space-x-3 mt-2">
            <span>{result.repo_name}</span>
            <Badge variant={result.status === 'completed' ? 'success' : 'warning'}>
              {result.status}
            </Badge>
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Analyzed on {format(new Date(result.created_at), 'PPP ')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => handleDownload('pdf')} className="text-sm">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button variant="secondary" onClick={() => handleDownload('md')} className="text-sm">
            <Download className="w-4 h-4" /> Markdown
          </Button>
          <Button variant="secondary" onClick={() => handleDownload('html')} className="text-sm">
            <Download className="w-4 h-4" /> HTML
          </Button>
        </div>
      </motion.div>

      <div className="space-y-12">
        <motion.div variants={item}><MetricsGrid result={result} /></motion.div>
        
        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ScoreCard title="Overall" score={result.scores.overall} />
            <ScoreCard title="Security" score={result.scores.security} icon={<Shield className="w-6 h-6" />} />
            <ScoreCard title="Performance" score={result.scores.performance} icon={<Zap className="w-6 h-6" />} />
            <ScoreCard title="Maintainability" score={result.scores.maintainability} icon={<FileCode className="w-6 h-6" />} />
            <ScoreCard title="Readability" score={result.scores.readability} icon={<Eye className="w-6 h-6" />} />
            <ScoreCard title="Architecture" score={result.scores.architecture} icon={<Layers className="w-6 h-6" />} />
          </div>
        </motion.div>

        {result.ai_review && (
          <motion.div variants={item}>
            <AIRecommendations aiReview={result.ai_review} />
          </motion.div>
        )}

        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Visual Breakdown</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 p-4"><SeverityPieChart issues={result.issues} /></Card>
            <Card className="lg:col-span-1 p-4"><CategoryBarChart issues={result.issues} /></Card>
            <Card className="lg:col-span-1 p-4"><LanguageChart breakdown={result.language_breakdown} /></Card>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-xl font-bold mb-4">Detailed Issues</h2>
          <IssueTable issues={result.issues} />
        </motion.div>
      </div>
    </motion.div>
  );
}
