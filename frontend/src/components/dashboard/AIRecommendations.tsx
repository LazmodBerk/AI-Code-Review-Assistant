import React from 'react';
import { AIReview } from '../../types';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface AIRecommendationsProps {
  aiReview?: AIReview;
}

export default function AIRecommendations({ aiReview }: AIRecommendationsProps) {
  if (!aiReview) return null;

  const categories: { key: keyof Omit<AIReview, 'summary'>; label: string }[] = [
    { key: 'bugs', label: 'Bugs' },
    { key: 'performance', label: 'Performance' },
    { key: 'security', label: 'Security' },
    { key: 'readability', label: 'Readability' },
    { key: 'maintainability', label: 'Maintainability' },
    { key: 'solid_violations', label: 'SOLID' },
    { key: 'design_patterns', label: 'Patterns' },
    { key: 'scalability', label: 'Scalability' },
  ];

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'neutral';
    }
  };

  const tabsData = categories.map((cat) => {
    const items = aiReview[cat.key] || [];
    const count = items.length;
    
    const content = (
      <div className="pt-4">
        {count === 0 ? (
          <div className="text-center py-8 text-text-muted">
            No issues found in this category! 🎉
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {items.map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card interactive className="border-border-color bg-glass-bg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary-color shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-text-primary">{item.issue}</h4>
                        <p className="text-sm text-text-muted mt-2">
                          <span className="font-medium text-text-primary">Suggestion:</span> {item.suggestion}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(item.severity)}>
                      {item.severity}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    );

    return {
      id: cat.key,
      label: `${cat.label} (${count})`,
      content
    };
  });

  return (
    <Card className="mt-8 border-t-4" style={{ borderTopColor: 'var(--primary-color)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary-color" />
        <h2 className="text-xl font-bold text-text-primary">AI Code Review Summary</h2>
      </div>
      
      <div className="p-4 rounded-lg mb-6 border border-border-color" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
        <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{aiReview.summary}</p>
      </div>

      <Tabs tabs={tabsData} defaultTab="bugs" />
    </Card>
  );
}
