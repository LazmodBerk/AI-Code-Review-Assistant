import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = 'var(--radius-md)',
  className, 
  ...props 
}) => {
  return (
    <div 
      className={`skeleton ${className || ''}`} 
      style={{ width, height, borderRadius }}
      {...props}
    />
  );
};
