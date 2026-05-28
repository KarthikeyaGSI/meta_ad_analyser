'use client';

import React from 'react';
import { useStore } from '../../../store/useStore';
import { analyticsApi } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatRoas, formatPercent, formatNumber } from '../../../utils/formatters';
import { FolderLock, AlertTriangle, Users, Play, Pause } from 'lucide-react';

export default function AdsetsExplorer() {
  const { activeAccount, dateRange, refreshTrigger } = useStore();

  // 1. Fetch Adsets
  const { data: adsetList = [], isLoading } = useQuery({
    queryKey: ['adsetsExplorer', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return [];
      const res = await analyticsApi.getAdsets(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  // targeting JSON parser
  const parseTargeting = (targeting: any): string => {
    if (!targeting) return 'Broad Audience';
    
    const parts = [];
    if (targeting.custom_audiences) {
      parts.push(`👥 Custom: ${targeting.custom_audiences.join(', ')}`);
    }
    if (targeting.interests) {
      parts.push(`🎯 Interests: ${targeting.interests.slice(0, 2).join(', ')}`);
    }
    
    const ageMin = targeting.age_min || 18;
    const ageMax = targeting.age_max || '65+';
    parts.push(`🎂 Age: ${ageMin}-${ageMax}`);
    
    if (targeting.gender && targeting.gender !== 'ALL') {
      parts.push(`🚻 Gender: ${targeting.gender.toLowerCase()}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'US Broad Audience';
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Ad Set Explorer <FolderLock className="w-5 h-5 text-primary" />
        </h1>
        <p className="text-sm text-muted">Auditable target audiences, bidding budgets, and demographic segments.</p>
      </div>

      {/* ADSETS TABLE PANEL */}
      <div className="glass-panel rounded-3xl relative overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-6 py-4.5 text-xs font-bold text-muted min-w-[280px]">Ad Set Name</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted">Status</th>
                <th className="px-6 py-4.5 text-xs font-bold text-muted min-w-[250px]">Targeting Profile</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted text-right">Daily Budget</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted text-right">Spend</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted text-right">ROAS</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted text-right">CPC</th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted text-right">Purchases</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(4).fill(0).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/[0.04] animate-pulse">
                    <td className="px-6 py-5"><div className="w-60 h-4.5 bg-white/10 rounded"></div></td>
                    <td className="px-4 py-5"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
                    <td className="px-6 py-5"><div className="w-48 h-4 bg-white/10 rounded"></div></td>
                    <td className="px-4 py-5" colSpan={5}>
                      <div className="h-4.5 bg-white/10 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : (adsetList || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-warning" />
                      <span className="text-sm font-semibold">No adsets syncing with your selection.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                (adsetList || []).map((as: any) => {
                  const isActive = as.status.toUpperCase() === 'ACTIVE';
                  
                  return (
                    <tr key={as.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4.5 font-semibold text-xs text-white max-w-[300px] truncate group-hover:text-primary transition-colors">
                        {as.name}
                        <p className="text-[10px] text-muted font-normal mt-0.5">{as.adsetId}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isActive 
                            ? 'text-success bg-success/15 border border-success/20' 
                            : 'text-muted bg-white/[0.04] border border-white/[0.07]'
                        }`}>
                          {isActive ? <Play className="w-2 h-2 fill-current" /> : <Pause className="w-2 h-2 fill-current" />}
                          {as.status}
                        </span>
                      </td>

                      {/* Targeting Parser */}
                      <td className="px-6 py-4.5 text-xs text-slate-300 font-semibold max-w-[280px] truncate">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium bg-white/[0.02] border border-white/[0.05] px-2.5 py-1 rounded-lg w-fit text-slate-300">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {parseTargeting(as.targeting)}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="px-4 py-4.5 text-xs text-white font-semibold text-right">
                        {as.budget > 0 ? `${formatCurrency(as.budget)}/d` : 'Using CBO'}
                      </td>

                      {/* Spend */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatCurrency(as.spend)}
                      </td>

                      {/* ROAS */}
                      <td className={`px-4 py-4.5 text-xs font-black text-right ${as.roas >= 2.5 ? 'text-success' : as.roas < 1.3 ? 'text-danger' : 'text-white'}`}>
                        {formatRoas(as.roas)}
                      </td>

                      {/* CPC */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatCurrency(as.cpc)}
                      </td>

                      {/* Purchases */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatNumber(as.purchases)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
