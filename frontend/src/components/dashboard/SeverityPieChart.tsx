import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Issue } from '../../types';

interface SeverityPieChartProps {
  issues: Issue[];
}

const COLORS = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#FCD34D',
  low: '#3B82F6',
  info: '#94A3B8',
};

export default function SeverityPieChart({ issues }: SeverityPieChartProps) {
  const data = React.useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [issues]);

  if (!data.length) return null;

  return (
    <div className="h-[300px] w-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-4 text-center">Issues by Severity</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
