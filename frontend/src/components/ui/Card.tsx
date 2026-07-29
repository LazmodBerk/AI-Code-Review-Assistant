import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, interactive, className, ...props }) => {
  return (
    <motion.div 
      className={`card ${interactive ? 'card-interactive' : ''} ${className || ''}`}
      whileHover={interactive ? { y: -5, borderColor: 'var(--primary-color)' } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={`card-header ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={`card-title ${className || ''}`} {...props}>
    {children}
  </h3>
);
