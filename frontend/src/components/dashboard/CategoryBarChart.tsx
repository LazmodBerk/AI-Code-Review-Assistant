import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Issue } from '../../types';

interface CategoryBarChartProps {
  issues: Issue[];
}

export default function CategoryBarChart({ issues }: CategoryBarChartProps) {
  const data = React.useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);

  if (!data.length) return null;

  return (
    <div className="h-[300px] w-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-4 text-center">Issues by Category</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
            <XAxis type="number" stroke="var(--text-muted)" />
            <YAxis dataKey="name" type="category" width={100} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="value" fill="var(--primary-color)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
