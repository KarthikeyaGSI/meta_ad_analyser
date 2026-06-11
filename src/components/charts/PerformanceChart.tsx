// src/components/charts/PerformanceChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

// Mock data representing spend and roas over time
const mockData = [
  { date: '2024-01', spend: 1200, roas: 2.1 },
  { date: '2024-02', spend: 1500, roas: 2.8 },
  { date: '2024-03', spend: 1800, roas: 3.2 },
  { date: '2024-04', spend: 1600, roas: 2.5 },
  { date: '2024-05', spend: 2000, roas: 3.6 },
];

export default function PerformanceChart() {
  return (
    <div className="card p-5">
      <h2 className="text-base font-semibold mb-4">Spend & ROAS Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="#a1a1aa" />
          <YAxis yAxisId="left" orientation="left" stroke="#a1a1aa" />
          <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={2} dot={false} name="Spend ($)" />
          <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={2} dot={false} name="ROAS" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
