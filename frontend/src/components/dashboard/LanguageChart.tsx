import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LanguageChartProps {
  breakdown?: Record<string, number>;
}

export default function LanguageChart({ breakdown }: LanguageChartProps) {
  const data = React.useMemo(() => {
    if (!breakdown) return [];
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [breakdown]);

  if (!data.length) return null;

  return (
    <div className="h-[300px] w-full flex flex-col">
      <h3 className="text-sm font-semibold text-text-primary mb-4 text-center">Language Breakdown</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--text-muted)" 
              tick={{ fontSize: 12 }} 
              angle={-45} 
              textAnchor="end" 
              height={50} 
            />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="value" fill="#A78BFA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
