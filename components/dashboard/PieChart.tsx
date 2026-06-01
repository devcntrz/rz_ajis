'use client';
import { useEffect, useState } from 'react';
import {
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = ['#BF4E02', '#1A5FA8', '#B87800', '#7A6055', '#1A7A45'];

export default function PieChart({ data }: PieChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />;
  }

  const cleanData = data.filter(d => d.value > 0);

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={cleanData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {cleanData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8, fontSize: 12 }} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
