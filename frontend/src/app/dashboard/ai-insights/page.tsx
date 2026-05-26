'use client';

import React from 'react';
import { useStore } from '../../../store/useStore';
import { analyticsApi } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit, AlertTriangle, AlertOctagon, TrendingUp, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiInsights() {
  const { activeAccount, refreshTrigger } = useStore();

  // 1. Fetch AI Recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['aiRecommendations', activeAccount?.id, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return [];
      const res = await analyticsApi.getRecommendations(activeAccount.id);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  // Helper to map recommendation icons & styles
  const getRecStyles = (type: string) => {
    switch (type) {
      case 'ALERT':
        return {
          bg: 'border-amber-500/20 bg-amber-500/[0.02]',
          glow: 'absolute top-0 left-0 w-full h-[2.5px] bg-amber-500',
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
        };
      case 'ALERT_SATURATION':
        return {
          bg: 'border-red-500/20 bg-red-500/[0.02]',
          glow: 'absolute top-0 left-0 w-full h-[2.5px] bg-red-500',
          badge: 'text-red-400 bg-red-500/10 border-red-500/20',
          icon: <AlertOctagon className="w-5 h-5 text-red-400" />
        };
      case 'OPPORTUNITY':
        return {
          bg: 'border-success/20 bg-success/[0.02]',
          glow: 'absolute top-0 left-0 w-full h-[2.5px] bg-success',
          badge: 'text-success bg-success/10 border-success/20',
          icon: <TrendingUp className="w-5 h-5 text-success" />
        };
      default:
        return {
          bg: 'border-primary/20 bg-primary/[0.02]',
          glow: 'absolute top-0 left-0 w-full h-[2.5px] bg-primary',
          badge: 'text-primary bg-primary/10 border-primary/20',
          icon: <BrainCircuit className="w-5 h-5 text-primary" />
        };
    }
  };

  // Helper to choose confidence visual bar color
  const getConfBarColor = (val: number) => {
    if (val >= 85) return 'bg-success';
    if (val >= 65) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Decision Intelligence Center <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
        </h1>
        <p className="text-sm text-muted">Surfacing rule-based ad anomalies, fatigue spikes, and scaling opportunities.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="glass-panel h-52 rounded-3xl animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center text-muted flex flex-col items-center justify-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <div>
            <h3 className="text-sm font-bold text-white">All Ad Operations Healthy</h3>
            <p className="text-xs text-muted mt-1">Aetheris is actively auditing. No fatigue alerts or CPM anomalies triggered.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec: any) => {
            const ui = getRecStyles(rec.type);
            const barColor = getConfBarColor(rec.confidence);

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`glass-panel border p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between ${ui.bg}`}
              >
                {/* Thin Colored Glow Top Border */}
                <div className={ui.glow}></div>

                {/* HEADER METRICS */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                      {ui.icon}
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider mb-2 ${ui.badge}`}>
                        {rec.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-extrabold text-white leading-tight">{rec.title}</h3>
                      <p className="text-[10px] text-primary/80 font-bold mt-1.5 truncate max-w-sm sm:max-w-xl">
                        🎯 Campaign: {rec.campaignName}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Confidence Score Tracker */}
                  <div className="w-full sm:w-44 shrink-0 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5 self-start">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted font-semibold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        AI Confidence
                      </span>
                      <span className="text-white font-extrabold">{rec.confidence}%</span>
                    </div>
                    {/* Bar progress */}
                    <div className="h-1.5 w-full bg-white/[0.04] border border-white/[0.06] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${rec.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* DETAIL DESCRIPTION */}
                <div className="space-y-4">
                  <div className="flex gap-4.5 justify-between items-center p-3 rounded-2xl bg-black/20 border border-white/[0.04]">
                    <div className="text-left">
                      <p className="text-[10px] font-semibold text-muted">Audited Metric</p>
                      <p className="text-xs font-bold text-slate-300 mt-0.5">{rec.metric}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-muted">Detected Value</p>
                      <p className="text-xs font-black text-danger mt-0.5">{rec.value}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {rec.description}
                  </p>

                  {/* ACTION RECOMMENDATION PLAN BOX */}
                  <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] border-l-[3px] border-l-primary space-y-1.5">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-primary" />
                      Actionable Implementation Steps
                    </h4>
                    <p className="text-xs text-muted leading-relaxed font-semibold">
                      {rec.actionableStep}
                    </p>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
