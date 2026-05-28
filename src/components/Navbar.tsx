'use client';

import React, { useEffect, useState } from 'react';
import { useStore, DateRange } from '../store/useStore';
import { analyticsApi } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Calendar, ChevronDown, Check, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { isSandboxMode } from '../lib/runtime';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { 
    activeAccount, 
    setActiveAccount, 
    availableAccounts, 
    setAvailableAccounts,
    dateRange, 
    setDateRange,
    triggerRefresh,
    sidebarCollapsed: collapsed
  } = useStore();

  const [accDropdownOpen, setAccDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // 1. Fetch available accounts connected to user session
  const { data: accountsData } = useQuery({
    queryKey: ['availableAccounts'],
    queryFn: async () => {
      const res = await analyticsApi.getAccounts();
      return res.data;
    }
  });

  useEffect(() => {
    if (accountsData && accountsData.length > 0) {
      const formatted = accountsData.map((a: any) => ({
        id: a.id,
        name: a.name,
        actId: a.actId
      }));
      
      // Prevent infinite rendering cascades by only updating when contents differ
      const hasChanged = availableAccounts.length !== formatted.length || 
                         availableAccounts.some((acc, idx) => acc.id !== formatted[idx]?.id);
      if (hasChanged) {
        setAvailableAccounts(formatted);
      }
      
      // Auto-select based on URL parameter first, then fallback to first account
      if (!activeAccount) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlAccountId = urlParams.get('accountId');
        if (urlAccountId) {
          const matched = formatted.find((a: any) => a.id === urlAccountId);
          if (matched) {
            setActiveAccount(matched);
            return;
          }
        }
        setActiveAccount(formatted[0]);
      }
    }
  }, [accountsData]);

  // Date Range Quick Sets
  const dateOptions = [
    { label: 'Today (1 Day)', days: 1 },
    { label: 'Last 7 Days (Week)', days: 7 },
    { label: 'Last 30 Days (Month)', days: 30 },
    { label: 'Last 90 Days (Quarter)', days: 90 },
    { label: 'Last 180 Days (6 Months)', days: 180 },
  ];

  const handleDateChange = (label: string, days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setDateRange({
      label,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setDateDropdownOpen(false);
    triggerRefresh();
  };

  // Sync click triggers manual backend sync
  const handleSyncClick = async () => {
    if (!activeAccount) return;
    setSyncing(true);
    try {
      await analyticsApi.triggerSync(activeAccount.id);
      triggerRefresh();
    } catch (err) {
      console.error('[Navbar Sync] Manual refresh failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header 
      className="fixed top-4 right-4 z-20 h-14 rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-3xl flex items-center justify-between px-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-300"
      style={{ 
        left: collapsed ? '112px' : '292px', 
        width: collapsed ? 'calc(100% - 128px)' : 'calc(100% - 308px)' 
      }}
    >
      {/* LEFT: ACCOUNT SWITCHER */}
      <div className="relative">
        <button 
          onClick={() => setAccDropdownOpen(!accDropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition text-xs font-semibold text-white btn-touch"
        >
          <div className="live-pulse-orb"></div>
          <span className="truncate max-w-[200px]">
            {activeAccount ? activeAccount.name : 'No Active Account'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        </button>

        {accDropdownOpen && (
          <>
            <div className="fixed inset-0 z-45" onClick={() => setAccDropdownOpen(false)}></div>
            <div className="absolute left-0 mt-2 z-50 w-64 rounded-2xl border border-white/[0.08] bg-[#0E1017]/95 p-1.5 shadow-glass-shadow backdrop-blur-xl">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2 border-b border-white/[0.04]">
                Switch Ad Account
              </p>
              <div className="mt-1 space-y-0.5 max-h-60 overflow-y-auto">
                {availableAccounts.map((acc) => {
                  const selected = activeAccount?.id === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => {
                        setActiveAccount(acc);
                        setAccDropdownOpen(false);
                        
                        // Sync routing parameters for clean separate routes
                        const params = new URLSearchParams(window.location.search);
                        params.set('accountId', acc.id);
                        router.push(`${pathname}?${params.toString()}`);
                        
                        triggerRefresh();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-medium transition btn-touch ${
                        selected 
                          ? 'bg-white/[0.06] text-white border border-white/[0.08]' 
                          : 'text-muted hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className="truncate">{acc.name}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: SEARCH, SYNC & DATE PICKER */}
      <div className="flex items-center gap-3">
        {/* Runtime Mode Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
          isSandboxMode 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        } text-[10px] font-bold uppercase tracking-widest`}>
          {isSandboxMode ? <ShieldAlert className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isSandboxMode ? 'Sandbox' : 'Live'}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncClick}
          disabled={syncing || !activeAccount || isSandboxMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition text-xs font-bold text-white disabled:opacity-50 btn-touch"
        >
          <RefreshCw className={`w-3 h-3 ${isSandboxMode ? 'text-muted' : 'text-primary'} ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Meta'}
        </button>

        {/* Date Selector */}
        <div className="relative">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition text-xs font-bold text-white btn-touch"
          >
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <span>{dateRange.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>

          {dateDropdownOpen && (
            <>
              <div className="fixed inset-0 z-45" onClick={() => setDateDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-2xl border border-white/[0.08] bg-[#0E1017]/95 p-1.5 shadow-glass-shadow backdrop-blur-xl">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2 border-b border-white/[0.04]">
                  Select Date Range
                </p>
                <div className="mt-1 space-y-0.5">
                  {dateOptions.map((opt) => {
                    const selected = dateRange.label === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => handleDateChange(opt.label, opt.days)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-medium transition btn-touch ${
                          selected 
                            ? 'bg-white/[0.06] text-white border border-white/[0.08]' 
                            : 'text-muted hover:text-white hover:bg-white/[0.02]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
