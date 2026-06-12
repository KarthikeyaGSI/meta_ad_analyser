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
    <div className="card p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold mb-4">Spend Over Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData} syncId="performance-charts" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#8b92a0" fontSize={12} tickMargin={8} />
            <YAxis stroke="#8b92a0" fontSize={12} tickFormatter={(val) => `$${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111316', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 6 }} name="Spend" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">ROAS Over Time</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={mockData} syncId="performance-charts" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#8b92a0" fontSize={12} tickMargin={8} />
            <YAxis stroke="#8b92a0" fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(val) => `${val}x`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111316', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 6 }} name="ROAS" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
