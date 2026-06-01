'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  data: Array<{ sesi: string; kehadiran: number; tgl: string }>;
}

export default function TrendChart({ data }: TrendChartProps) {
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorKehadiran" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BF4E02" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#BF4E02" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F2EAE3" />
          <XAxis dataKey="sesi" stroke="#7A6055" fontSize={11} tickLine={false} />
          <YAxis stroke="#7A6055" fontSize={11} tickLine={false} unit="%" />
          <Tooltip contentStyle={{ background: '#FFFFFF', border: '1.5px solid #F0C4A0', borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="kehadiran" name="Kehadiran" stroke="#BF4E02" strokeWidth={2} fillOpacity={1} fill="url(#colorKehadiran)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
