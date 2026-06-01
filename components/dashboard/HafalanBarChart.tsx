'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface HafalanBarChartProps {
  data: Array<{ name: string; value: number }>;
}

export default function HafalanBarChart({ data }: HafalanBarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />;
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2EAE3" horizontal={false} />
          <XAxis type="number" stroke="#7A6055" fontSize={11} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="#7A6055" fontSize={11} tickLine={false} width={80} />
          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" name="Jumlah" radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#BF4E02" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
