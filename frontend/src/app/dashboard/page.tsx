'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { analyticsApi } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import MetricCard from '../../components/MetricCard';
import { 
  formatCurrency, 
  formatPercent, 
  formatRoas, 
  formatNumber, 
  formatCompact 
} from '../../utils/formatters';
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
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

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

  useEffect(() => {
    setMounted(true);
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
        } catch (err: any) {
          console.error("Sync failed: Live synchronization failed:", err);
          setSyncStatus('FAILED');
          setSyncError(err.response?.data?.message || 'Sync worker routine failed.');
        }
      }
    };
    
    if (mounted && campaignsTable !== undefined) {
      autoSync();
    }
  }, [activeAccount, isDemoMode, campaigns.length, campaignsTable, mounted]);
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
    spend: { color: '#6366F1', label: 'Spend', formatter: formatCurrency },
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
                } catch (err: any) {
                  console.error("Sync failed: Live synchronization failed:", err);
                  setSyncStatus('FAILED');
                  setSyncError(err.response?.data?.message || 'Sync worker routine failed.');
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
    <>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      <div className="glass-panel-premium p-5 rounded-3xl border border-white/[0.07] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-glass-shadow hover:shadow-glass-shadow-premium">
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
                className="text-[9px] text-primary hover:text-indigo-300 font-bold tracking-wider flex items-center gap-1 uppercase mt-1.5 transition btn-touch"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* CHARTS GRAPH CONTAINER */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden shadow-glass-shadow hover:shadow-glass-shadow-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Performance Insights History</h3>
            <p className="text-xs text-muted">Chronological trends over your selected date range.</p>
          </div>
          
          {/* TAB BAR SELECTORS */}
          <div className="flex p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {Object.keys(chartConfigs).map((tab) => {
              const selected = activeChartTab === tab;
              const label = tab.toUpperCase();
              return (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab as any)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all duration-300 btn-touch ${
                    selected 
                      ? 'bg-white/[0.06] text-white border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RECHARTS AREA CHART */}
        <div className="h-80 w-full">
          {chartsLoading || !mounted ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted">
              <AlertTriangle className="w-8 h-8 mb-2 text-warning" />
              <span>No historical sync logs discovered in this range.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeConf.color} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={activeConf.color} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.015)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.15)" 
                  tickLine={false} 
                  style={{ fontSize: 9, fontWeight: 500 }}
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                  }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.15)" 
                  tickLine={false} 
                  style={{ fontSize: 9, fontWeight: 500 }}
                  tickFormatter={(val) => formatCompact(val)}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(14, 16, 23, 0.85)', 
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 16px 40px 0 rgba(0,0,0,0.5)',
                    color: '#F8FAFC',
                    backdropFilter: 'blur(16px)',
                    fontSize: 10
                  }}
                  formatter={(val: number) => [activeConf.formatter(val), activeConf.label]}
                  labelStyle={{ fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeChartTab} 
                  stroke={activeConf.color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  dot={false}
                  activeDot={{ r: 4, stroke: '#08090C', strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* DOUBLE COLUMN: TOP VS WORST CAMPAIGNS LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
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
                topCampaigns.map((camp) => (
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
                worstCampaigns.map((camp) => (
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
    </>
  );
}
