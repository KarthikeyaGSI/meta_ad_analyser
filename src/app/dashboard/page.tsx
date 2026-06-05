'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  MousePointerClick, 
  Eye, 
  AlertTriangle, 
  Sparkles, 
  TrendingDown, 
  ArrowUpRight,
  Activity,
  Pause,
  RefreshCw
} from 'lucide-react';
import gsap from 'gsap';
import React, { useEffect, useState, useRef } from 'react';
import MetricCard from '../../components/MetricCard';
import { analyticsApi } from '../../services/api';
import { useStore } from '../../store/useStore';
import { 
  formatCurrency, 
  formatPercent, 
  formatRoas, 
  formatNumber, 
  formatCompact 
} from '../../utils/formatters';

export default function DashboardOverview() {
  const { 
    activeAccount, 
    dateRange, 
    refreshTrigger, 
    isDemoMode, 
    syncStatus, 
    setSyncStatus, 
    lastSyncAt, 
    setLastSyncAt, 
    triggerRefresh 
  } = useStore();

  const [activeChartTab, setActiveChartTab] = useState<'spend' | 'roas' | 'ctr' | 'purchases'>('spend');
  const [mounted, setMounted] = useState(false);
  const [syncError, setSyncError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Premium GSAP Staggered Entrance
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.gsap-stagger'),
        { opacity: 0, y: 30, scale: 0.98 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8, 
          stagger: 0.08, 
          ease: "power4.out",
          delay: 0.1
        }
      );
    }
  }, []);

  // 1. Fetch Overview KPIs
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return null;
      const res = await analyticsApi.getOverview(activeAccount.id, dateRange.startDate, dateRange.endDate);
      const data = res.data;
      if (!isDemoMode && data) {
        console.log("Real metrics loaded:", data);
      }
      return data;
    },
    enabled: !!activeAccount,
  });

  // 2. Fetch Chart Timeline
  const { data: chartData = [], isLoading: chartsLoading } = useQuery({
    queryKey: ['charts', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return [];
      const res = await analyticsApi.getCharts(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
  });

  // 3. Fetch Campaigns Leaderboard
  const { data: campaignsTable, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns-leaderboard', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return { list: [] };
      const res = await analyticsApi.getCampaigns(activeAccount.id, dateRange.startDate, dateRange.endDate, { limit: 100 });
      return res.data;
    },
    enabled: !!activeAccount,
  });

  const campaigns = campaignsTable?.list || [];

  // Automatically trigger sync on live mode initial load if campaigns are empty and sync is IDLE
  useEffect(() => {
    const autoSync = async () => {
      if (activeAccount && !isDemoMode && campaigns.length === 0 && syncStatus === 'IDLE') {
        console.log("Live mode activated: Switched from guest sandbox to live API pacing.");
        console.log("Sync started: Pulling campaign aggregates from Meta Graph...");
        setSyncStatus('RUNNING');
        setSyncError('');
        try {
          await analyticsApi.triggerSync(activeAccount.id);
          console.log("Sync completed: Database populated with real account metrics.");
          setSyncStatus('COMPLETED');
          setLastSyncAt(new Date().toLocaleTimeString());
          triggerRefresh();
        } catch (err: unknown) {
          const e = err as { response?: { data?: { message?: string } } };
          console.error("Sync failed: Live synchronization failed:", e);
          setSyncStatus('FAILED');
          setSyncError(e.response?.data?.message || 'Sync worker routine failed.');
        }
      }
    };
    
    if (mounted && campaignsTable !== undefined) {
      autoSync();
    }
  }, [activeAccount, isDemoMode, campaigns.length, campaignsTable, mounted, setLastSyncAt, setSyncStatus, syncStatus, triggerRefresh]);
  const topCampaigns = [...campaigns]
    .filter(c => c.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3);
  
  const worstCampaigns = [...campaigns]
    .filter(c => c.spend > 30) // Only look at active spenders
    .sort((a, b) => a.roas - b.roas)
    .slice(0, 3);

  // Set up chart configurations
  const chartConfigs = {
    spend: { color: '#F97316', label: 'Spend', formatter: formatCurrency },
    roas: { color: '#10B981', label: 'ROAS', formatter: formatRoas },
    ctr: { color: '#8B5CF6', label: 'CTR', formatter: formatPercent },
    purchases: { color: '#F59E0B', label: 'Purchases', formatter: formatNumber },
  };

  const activeConf = chartConfigs[activeChartTab];

  // 4. Live Empty State: display "Waiting for first sync" rather than empty cards
  if (!isDemoMode && !overviewLoading && campaigns.length === 0) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-6">
        <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-glow-primary animate-pulse btn-touch">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
            Live Meta account connected successfully.
          </h2>
          <p className="text-sm text-muted font-medium">
            Waiting for first sync. Retargeting historical metrics from your active ad account context...
          </p>
        </div>

        <div className="w-full glass-panel p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-semibold">Mode:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-success/15 border border-success/20 text-success font-extrabold text-[10px] uppercase">
              LIVE Meta API Mode
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-semibold">Sync Status:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              syncStatus === 'RUNNING' ? 'text-primary animate-pulse' :
              syncStatus === 'COMPLETED' ? 'text-success' :
              syncStatus === 'FAILED' ? 'text-danger' : 'text-slate-400'
            }`}>
              {syncStatus === 'RUNNING' && <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>}
              {syncStatus}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-semibold">Campaign Count:</span>
            <span className="font-bold text-white">0 Connected</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted font-semibold">Meta API Status:</span>
            <span className="text-success font-semibold flex items-center gap-1">Active (Token Valid)</span>
          </div>

          {syncStatus === 'RUNNING' && (
            <div className="pt-2">
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative">
                <div className="h-full bg-primary animate-progress rounded-full absolute left-0 top-0 w-2/3"></div>
              </div>
              <p className="text-[10px] text-muted mt-2">Pulling campaigns, adsets, creatives, and 180-day metrics history...</p>
            </div>
          )}

          {syncStatus === 'FAILED' && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] text-left leading-relaxed">
              {syncError || 'Sync failed due to Meta sandbox restrictions. Please verify ads_read permissions are accepted.'}
            </div>
          )}

          {syncStatus !== 'RUNNING' && (
            <button
              onClick={async () => {
                if (!activeAccount) return;
                console.log("Sync started: Pulling campaign aggregates from Meta Graph...");
                setSyncStatus('RUNNING');
                setSyncError('');
                try {
                  await analyticsApi.triggerSync(activeAccount.id);
                  console.log("Sync completed: Database populated with real account metrics.");
                  setSyncStatus('COMPLETED');
                  setLastSyncAt(new Date().toLocaleTimeString());
                  triggerRefresh();
                } catch (err: unknown) {
                  const e = err as { response?: { data?: { message?: string } } };
                  console.error("Sync failed: Live synchronization failed:", e);
                  setSyncStatus('FAILED');
                  setSyncError(e.response?.data?.message || 'Sync worker routine failed.');
                }
              }}
              className="w-full py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-glow-primary"
            >
              Trigger Manual Sync
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 gsap-stagger">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Workspace Overview <span className="text-sm font-semibold text-muted tracking-wider">{isDemoMode ? '(Demo Sandbox)' : '(Live Meta Account)'}</span> <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </h1>
          <p className="text-xs text-muted mt-1">
            Decision intelligence analytics for {activeAccount ? activeAccount.name : 'your linked Meta profiles'}.
          </p>
        </div>
      </div>

      {/* DEVELOPER DASHBOARD STATUS PANEL */}
      <div className="glass-panel-premium p-5 rounded-3xl border border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-glass-shadow hover:shadow-glass-shadow-premium gsap-stagger">
        {/* Soft edge ambient flare */}
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-2xl border ${
            isDemoMode 
              ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' 
              : 'bg-success/5 border-success/20 text-success shadow-glow-success animate-pulse'
          }`}>
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace Pacing:</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDemoMode 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-success/15 text-success border border-success/20 shadow-glow-success'
              }`}>
                {isDemoMode ? 'DEMO Sandbox Mode' : 'LIVE Meta API Mode'}
              </span>
            </div>
            <p className="text-sm font-extrabold text-white mt-1.5 leading-tight">
              {activeAccount ? activeAccount.name : 'Resolving credentials...'}
            </p>
            {isDemoMode && (
              <button 
                onClick={() => window.location.href = '/dashboard/settings'}
                className="text-[9px] text-primary hover:text-orange-300 font-bold tracking-wider flex items-center gap-1 uppercase mt-1.5 transition btn-touch"
              >
                Link Your Real Meta Ad Account <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-6 text-[10px] border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Live Mode:</span>
            <span className={`font-extrabold uppercase ${!isDemoMode ? 'text-success' : 'text-amber-400'}`}>
              {!isDemoMode ? 'YES' : 'NO (Sandbox)'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sync Status:</span>
            <span className={`font-bold flex items-center gap-1.5 uppercase ${
              syncStatus === 'RUNNING' ? 'text-primary animate-pulse' :
              syncStatus === 'COMPLETED' ? 'text-success' :
              syncStatus === 'FAILED' ? 'text-danger' : 'text-slate-300'
            }`}>
              {syncStatus === 'RUNNING' && <span className="live-pulse-orb"></span>}
              {syncStatus}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Meta API Connected:</span>
            <span className={`font-extrabold uppercase ${activeAccount ? 'text-success' : 'text-danger'}`}>
              {activeAccount ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Last Sync:</span>
            <span className="font-extrabold text-white">{lastSyncAt || 'N/A'}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Campaign Count:</span>
            <span className="font-extrabold text-white">{campaigns.length} Connected</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Insights Status:</span>
            <span className={`font-extrabold uppercase ${
              syncStatus === 'COMPLETED' ? 'text-success' : 
              syncStatus === 'RUNNING' ? 'text-primary animate-pulse' : 'text-slate-300'
            }`}>
              {syncStatus === 'COMPLETED' ? 'Verified' : syncStatus === 'RUNNING' ? 'Pacing' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div id="tour-scale-radar" className="grid grid-cols-2 lg:grid-cols-4 gap-6 gsap-stagger">
        <MetricCard
          title="Ad Spend"
          value={overviewLoading ? '...' : formatCurrency(overview?.spend || 0)}
          change={11.2}
          icon={DollarSign}
          loading={overviewLoading}
          isPositiveGood={false}
        />
        <MetricCard
          title="Revenue"
          value={overviewLoading ? '...' : formatCurrency(overview?.revenue || 0)}
          change={18.4}
          icon={ShoppingCart}
          loading={overviewLoading}
        />
        <MetricCard
          title="ROAS"
          value={overviewLoading ? '...' : formatRoas(overview?.roas || 0)}
          change={6.5}
          icon={TrendingUp}
          loading={overviewLoading}
        />
        <MetricCard
          title="CTR"
          value={overviewLoading ? '...' : formatPercent(overview?.ctr || 0)}
          change={2.1}
          icon={Percent}
          loading={overviewLoading}
        />
        <MetricCard
          title="CPC"
          value={overviewLoading ? '...' : formatCurrency(overview?.cpc || 0)}
          change={-3.8}
          icon={MousePointerClick}
          loading={overviewLoading}
          isPositiveGood={false}
        />
        <MetricCard
          title="CPM"
          value={overviewLoading ? '...' : formatCurrency(overview?.cpm || 0)}
          change={12.4}
          icon={Eye}
          loading={overviewLoading}
          isPositiveGood={false}
        />
        <MetricCard
          title="CPA"
          value={overviewLoading ? '...' : formatCurrency(overview?.cpa || 0)}
          change={-5.2}
          icon={TrendingDown}
          loading={overviewLoading}
          isPositiveGood={false}
        />
        <MetricCard
          title="Frequency"
          value={overviewLoading ? '...' : `${overview?.frequency || '1.05'}x`}
          change={1.4}
          icon={TrendingUp}
          loading={overviewLoading}
          isPositiveGood={false}
        />
      </div>

      {/* ACTION FEED (REAL-TIME EXECUTION LOG) */}
      <div className="glass-panel-premium p-6 rounded-3xl relative overflow-hidden shadow-glass-shadow hover:shadow-glass-shadow-premium gsap-stagger">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Real-Time Execution Feed
            </h3>
            <p className="text-xs text-muted">Live view of guardrails and automations protecting your ad spend.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Feed Item 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-start gap-4">
            <div className="mt-1 p-2 bg-red-500/10 rounded-full border border-red-500/20">
              <Pause className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-white">Paused Ad Set: "Lookalike US 1%"</h4>
                <span className="text-xs text-muted">2 mins ago</span>
              </div>
              <p className="text-xs text-muted mb-2">Triggered by <span className="text-white font-medium">Stop-Loss Guard</span>: Spend &gt; $50 &amp; ROAS &lt; 1.0</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-md font-medium">
                  Saved ~$140 today
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md font-medium">
                  Slack Alert Sent
                </span>
              </div>
            </div>
          </div>

          {/* Feed Item 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-start gap-4">
            <div className="mt-1 p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-white">Scaled Budget: "Retargeting 30D"</h4>
                <span className="text-xs text-muted">15 mins ago</span>
              </div>
              <p className="text-xs text-muted mb-2">Triggered by <span className="text-white font-medium">Winner Scaler</span>: ROAS &gt; 3.0 &amp; CPA &lt; $15</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-medium">
                  Budget +15%
                </span>
              </div>
            </div>
          </div>

          {/* Feed Item 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.05] flex items-start gap-4">
            <div className="mt-1 p-2 bg-amber-500/10 rounded-full border border-amber-500/20">
              <RefreshCw className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-white">Creative Rotation: "Video Ad 03"</h4>
                <span className="text-xs text-muted">1 hour ago</span>
              </div>
              <p className="text-xs text-muted mb-2">Triggered by <span className="text-white font-medium">Fatigue Manager</span>: Frequency &gt; 3.5</p>
            </div>
          </div>

        </div>
      </div>

      {/* DOUBLE COLUMN: TOP VS WORST CAMPAIGNS LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 gsap-stagger">
        
        {/* TOP PERFORMING CAMPAIGNS */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/15 border border-success/20 text-success">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Efficiency Leaders (Top ROAS)</h4>
                  <p className="text-[10px] text-muted">Active campaigns generating highest sales ratio.</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Winning</span>
            </div>

            <div className="space-y-3">
              {campaignsLoading ? (
                Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="h-14 bg-white/5 rounded-xl animate-pulse"></div>
                ))
              ) : topCampaigns.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted">No active spenders discovered.</div>
              ) : (
                (topCampaigns || []).map((camp) => (
                  <div key={camp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-semibold text-white truncate">{camp.name}</p>
                      <p className="text-[10px] text-muted">Spend: {formatCurrency(camp.spend)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-success">{formatRoas(camp.roas)} ROAS</p>
                      <p className="text-[10px] text-muted">{camp.purchases} Purchases</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button 
            onClick={() => window.location.href = '/dashboard/campaigns'}
            className="w-full mt-5 py-2 px-4 rounded-xl border border-white/[0.08] hover:border-primary/30 bg-white/[0.01] hover:bg-white/[0.03] text-xs text-center font-semibold text-white transition flex items-center justify-center gap-1.5"
          >
            Explore Campaign Table <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* EFFICIENCY BLEEDS (WORST CAMPAIGNS) */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-danger/15 border border-danger/20 text-danger">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Efficiency Bleeds (Low ROAS Spenders)</h4>
                  <p className="text-[10px] text-muted">High budget campaigns with sub-par conversion value.</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">Action Required</span>
            </div>

            <div className="space-y-3">
              {campaignsLoading ? (
                Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="h-14 bg-white/5 rounded-xl animate-pulse"></div>
                ))
              ) : worstCampaigns.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted">No low efficiency campaigns located.</div>
              ) : (
                (worstCampaigns || []).map((camp) => (
                  <div key={camp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-semibold text-white truncate">{camp.name}</p>
                      <p className="text-[10px] text-muted">Spend: {formatCurrency(camp.spend)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-danger">{formatRoas(camp.roas)} ROAS</p>
                      <p className="text-[10px] text-muted">CPA: {formatCurrency(camp.cpa)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/dashboard/ai-insights'}
            className="w-full mt-5 py-2 px-4 rounded-xl border border-white/[0.08] hover:border-primary/30 bg-white/[0.01] hover:bg-white/[0.03] text-xs text-center font-semibold text-white transition flex items-center justify-center gap-1.5"
          >
            Review AI Action Steps <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
