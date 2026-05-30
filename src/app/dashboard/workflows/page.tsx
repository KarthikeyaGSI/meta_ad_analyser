'use client';

import { motion } from 'framer-motion';
import { Network, Plus, Zap, Activity, Clock, Play, Pause, MoreVertical, Search, ArrowRight, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';

const dummyRules = [
  { id: 1, name: 'Stop-Loss Guard', condition: 'If Spend > $50 & ROAS < 1.0', action: 'Pause Ad Set + Slack Alert', status: 'active', runs: 124, lastTriggered: '10 mins ago' },
  { id: 2, name: 'Winner Scaler', condition: 'If ROAS > 3.0 & CPA < $15', action: 'Increase Budget by 15%', status: 'active', runs: 42, lastTriggered: '2 hours ago' },
  { id: 3, name: 'Fatigue Manager', condition: 'If Frequency > 3.5', action: 'Rotate Creative', status: 'paused', runs: 8, lastTriggered: '3 days ago' },
];

export default function WorkflowsPage() {
  const { isPremium, brandColor } = useStore();
  const [rules, setRules] = useState(dummyRules);

  const toggleRule = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  if (!isPremium) return null; // Guarded by Sidebar UpgradeModal

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-primary" />
            Automation & Rules
          </h1>
          <p className="text-muted mt-1">24/7 AI-driven campaign management and guardrails.</p>
        </div>
        
        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1">Active Rules</p>
          <p className="text-3xl font-extrabold text-white">2</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1">Total Executions</p>
          <p className="text-3xl font-extrabold text-white">174</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1">Budget Saved</p>
          <p className="text-3xl font-extrabold text-white">~$1,240</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search rules..." className="w-full bg-white/5 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted font-semibold">
              <th className="p-4 font-medium">Rule Name</th>
              <th className="p-4 font-medium">Condition</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rules.map((rule, idx) => (
              <motion.tr 
                key={rule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4 font-semibold text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    {rule.name}
                  </div>
                </td>
                <td className="p-4 text-white/70 font-mono text-xs bg-white/[0.01] rounded">
                  {rule.condition}
                </td>
                <td className="p-4 text-white/90">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-muted" />
                    {rule.action}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    rule.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white/50'
                  }`}>
                    {rule.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {rule.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => toggleRule(rule.id)} className="p-2 hover:bg-white/10 rounded transition-colors mr-2">
                    {rule.status === 'active' ? <Pause className="w-4 h-4 text-white/50" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded transition-colors text-white/50">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
