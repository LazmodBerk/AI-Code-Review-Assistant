import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  title: string;
  score: number;
  icon?: React.ReactNode;
  description?: string;
}

export default function ScoreCard({ title, score, icon, description }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (val: number) => {
    if (val < 40) return 'var(--danger-color)';
    if (val < 70) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <Card interactive className="flex flex-col items-center justify-center text-center relative overflow-hidden group">
      <div className="absolute top-4 right-4 text-text-muted opacity-50">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
      
      <div className="relative w-24 h-24 mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            style={{ stroke: 'var(--border-color)' }}
            strokeWidth="8"
            fill="transparent"
            r="36"
            cx="40"
            cy="40"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ stroke: getColor(score) }}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
            r="36"
            cx="40"
            cy="40"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
            {animatedScore}
          </span>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-text-muted mt-2">{description}</p>
      )}
    </Card>
  );
}
