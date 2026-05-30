'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Image as ImageIcon, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';
import React from 'react';
import { analyticsApi } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import { formatCurrency, formatPercent, formatRoas } from '../../../utils/formatters';

export default function CreativesExplorer() {
  const { activeAccount, dateRange, refreshTrigger, isPremium } = useStore();

  // 1. Fetch Creatives
  const { data: creativeList = [], isLoading } = useQuery({
    queryKey: ['creativesExplorer', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return [];
      const res = await analyticsApi.getCreatives(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  // Decide fatigue color schemes
  const getFatigueColor = (score: number) => {
    if (score < 4.0) return { text: 'text-success bg-success/10 border-success/20', bar: 'bg-success', label: 'Fresh' };
    if (score < 7.0) return { text: 'text-warning bg-warning/10 border-warning/20', bar: 'bg-warning', label: 'Fatiguing' };
    return { text: 'text-danger bg-danger/10 border-danger/20', bar: 'bg-danger', label: 'Saturated' };
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Creatives Dashboard <ImageIcon className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-muted">Audit visual assets performance, copywriting hooks and audience saturation rates.</p>
      </div>

      {/* CREATIVE GRID CARDS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="glass-panel h-[460px] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (creativeList || []).length === 0 ? (
        <div className="glass-panel p-16 rounded-3xl text-center text-muted">
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <span className="text-sm font-semibold">No active creatives discovered within this budget range.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(creativeList || []).map((cr: { id: string; name: string; format: string; spend: number; ctr: number; roas: number; fatigueScore: number; frequency: number; imageUrl?: string; callToActionType?: string; headline?: string; body?: string }) => {
            const colors = getFatigueColor(cr.fatigueScore);
            
            return (
              <motion.div
                key={cr.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-panel rounded-3xl relative overflow-hidden flex flex-col justify-between"
              >
                {/* 1. VISUAL PREVIEW HEADER */}
                <div className="h-44 w-full relative overflow-hidden bg-black/40 border-b border-white/[0.06]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cr.imageUrl}
                    alt={cr.name}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition duration-300"
                  />
                  
                  {/* Performance overlay tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider bg-black/60 backdrop-blur border border-white/10 text-white flex items-center gap-1">
                      <Flame className="w-3 h-3 text-primary" />
                      {cr.callToActionType}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${colors.text}`}>
                      {colors.label} ({cr.fatigueScore})
                    </span>
                  </div>
                </div>

                {/* 2. COPY & TEXT PANELS */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">{cr.headline}</h4>
                    <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{cr.body}</p>
                  </div>

                  {/* 3. PERFORMANCE GRID */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.06] mb-4 bg-white/[0.005]">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-muted mb-0.5">Spend</p>
                      <p className="text-xs font-bold text-white">{formatCurrency(cr.spend)}</p>
                    </div>
                    <div className="text-center border-x border-white/[0.06]">
                      <p className="text-[10px] font-semibold text-muted mb-0.5">CTR (7D)</p>
                      <p className="text-xs font-bold text-primary">{formatPercent(cr.ctr)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-muted mb-0.5">ROAS</p>
                      <p className="text-xs font-black text-success">{formatRoas(cr.roas)}</p>
                    </div>
                  </div>

                  {/* 4. PREMIUM FATIGUE AUDIT METER */}
                  {isPremium ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted font-semibold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Ad Saturation Pacing
                        </span>
                        <span className="text-white font-bold">{cr.fatigueScore}/10</span>
                      </div>

                      {/* Progress slider bar */}
                      <div className="h-1.5 w-full bg-white/[0.04] border border-white/[0.06] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${colors.bar}`}
                          style={{ width: `${cr.fatigueScore * 10}%` }}
                        ></div>
                      </div>
                      
                      {cr.fatigueScore >= 7.0 && (
                        <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20 flex gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <p className="text-[10px] text-red-400 leading-tight">AI predicts audience burnout within 3 days. Prepare to rotate.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 p-3 h-[60px] flex items-center justify-center cursor-pointer">
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center transition-all group-hover:bg-black/50">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-primary" />
                          Unlock AI Fatigue Predictor
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full blur-sm"></div>
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
