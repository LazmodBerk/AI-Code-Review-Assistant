import React from 'react';
import { FileCode, AlertTriangle, Code, Layers } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { Card } from '../ui/Card';
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

interface MetricsGridProps {
  result: AnalysisResult;
}

export default function MetricsGrid({ result }: MetricsGridProps) {
  const languagesCount = result.language_breakdown ? Object.keys(result.language_breakdown).length : 0;

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card interactive className="flex items-center gap-4 h-full" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-color)' }}>
            <FileCode size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Files</p>
            <p className="text-2xl font-bold text-text-primary">{result.total_files}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card interactive className="flex items-center gap-4 h-full" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <div className="p-3 rounded-lg" style={{ background: 'var(--success-bg)', color: 'var(--success-color)' }}>
            <Code size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Lines</p>
            <p className="text-2xl font-bold text-text-primary">{result.total_lines}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card interactive className="flex items-center gap-4 h-full" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <div className="p-3 rounded-lg" style={{ background: 'var(--danger-bg)', color: 'var(--danger-color)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Total Issues</p>
            <p className="text-2xl font-bold text-text-primary">{result.issues?.length || 0}</p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card interactive className="flex items-center gap-4 h-full" style={{ borderLeft: '4px solid #A78BFA' }}>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#A78BFA' }}>
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Languages</p>
            <p className="text-2xl font-bold text-text-primary">{languagesCount}</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
