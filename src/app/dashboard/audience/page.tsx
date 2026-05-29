'use client';

import { motion } from 'framer-motion';
import { Users, Smartphone, Monitor, Globe } from 'lucide-react';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ageData = [
  { name: '18-24', value: 15 },
  { name: '25-34', value: 45 },
  { name: '35-44', value: 25 },
  { name: '45-54', value: 10 },
  { name: '55+', value: 5 },
];

const platformData = [
  { name: 'Facebook', value: 55 },
  { name: 'Instagram', value: 35 },
  { name: 'Audience Network', value: 10 },
];

const deviceData = [
  { name: 'Mobile', value: 78 },
  { name: 'Desktop', value: 20 },
  { name: 'Tablet', value: 2 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

export default function AudienceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> Audience Insights
          </h1>
          <p className="text-muted text-sm mt-1">Analyze demographics, device usage, and platform distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Age Demographics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl md:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Age Distribution
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device Usage */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-pink-400" /> Devices
            </h2>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, 'Users']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Platform Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl md:col-span-3"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" /> Platform Placement
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformData.map((platform, index) => (
              <div key={platform.name} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS[index]}20` }}>
                    {index === 0 ? <Users className="w-5 h-5" style={{ color: COLORS[index] }} /> : 
                     index === 1 ? <Smartphone className="w-5 h-5" style={{ color: COLORS[index] }} /> : 
                     <Monitor className="w-5 h-5" style={{ color: COLORS[index] }} />}
                  </div>
                  <span className="font-semibold text-white">{platform.name}</span>
                </div>
                <span className="text-2xl font-bold text-white">{platform.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
