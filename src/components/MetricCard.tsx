'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. 12.4 for +12.4%, -4.2 for -4.2%
  changeLabel?: string; // e.g. "vs last 30d"
  icon: LucideIcon;
  loading?: boolean;
  isPositiveGood?: boolean; // Spend increases are sometimes "negative" visually, but generally green is up
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs last period', 
  icon: Icon, 
  loading = false,
  isPositiveGood = true
}: MetricCardProps) {
  
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="w-20 h-4 bg-white/5 rounded-xl"></div>
          <div className="w-8.5 h-8.5 bg-white/5 rounded-xl"></div>
        </div>
        <div className="w-28 h-8 bg-white/5 rounded-xl mb-3"></div>
        <div className="w-36 h-3.5 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  const isPositive = change ? change >= 0 : true;
  const showChange = change !== undefined;
  
  // Decide badge color
  let badgeColor = 'text-muted bg-white/[0.04]';
  if (showChange) {
    if (isPositive) {
      badgeColor = isPositiveGood ? 'text-success bg-success/10' : 'text-danger bg-danger/10';
    } else {
      badgeColor = isPositiveGood ? 'text-danger bg-danger/10' : 'text-success bg-success/10';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="glass-panel glass-panel-interactive p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-glass-shadow hover:shadow-glass-shadow-premium group"
    >
      {/* CARD ACCENT RADIANT REFLECTION */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.005] pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] group-hover:text-primary transition-colors duration-300">
            <Icon className="w-4.5 h-4.5" />
          </div>
        </div>

        <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
          {value}
        </h3>
      </div>

      {showChange && (
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded-full ${badgeColor} shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-muted tracking-wide">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
