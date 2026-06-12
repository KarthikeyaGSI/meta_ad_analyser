'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle, TrendingUp, ArrowRight, RefreshCw,
  BarChart3, CheckCircle2, Clock, ArrowUpRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../client/store/useStore';
import { analyticsApi } from '../../services/api';
import { formatCurrency, formatRoas } from '../../shared/utils/formatters';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Skeleton } from '@/components/ui/skeleton';
import PerformanceChart from '@/components/charts/PerformanceChart';

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = 'critical' | 'warning' | 'opportunity';

interface Insight {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  estimatedImpact: string;
  recommendedAction: string;
  affectedEntity?: string;
}

// ─── Static mock insights for demo (in production these come from Convex healthMetrics) ───
const DEMO_INSIGHTS: Insight[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Audience fatigue in "Lookalike US 1%"',
    description: 'Frequency has climbed to 4.6 over the past 14 days. Click-through rate is down 38% while CPA has risen 34%.',
    estimatedImpact: '~$2,140 additional wasted spend per month if unresolved.',
    recommendedAction: 'Pause this ad set, refresh creative, and exclude recent purchasers.',
    affectedEntity: 'Lookalike US 1%',
  },
  {
    id: '2',
    severity: 'critical',
    title: 'Zero-conversion campaign still spending',
    description: '"Brand Awareness Q4" has spent $890 over 21 days with 0 recorded purchases.',
    estimatedImpact: '$890 in unrecoverable spend. Trend is worsening.',
    recommendedAction: 'Pause this campaign. Review attribution window and conversion event setup.',
    affectedEntity: 'Brand Awareness Q4',
  },
  {
    id: '3',
    severity: 'warning',
    title: 'Rising CPM — auction pressure detected',
    description: 'CPM increased 31% over 7 days without a corresponding increase in impressions, suggesting increased auction competition.',
    estimatedImpact: 'Estimated +18% CPA if CPM trend continues another 7 days.',
    recommendedAction: 'Broaden target audience or test additional placements to reduce auction pressure.',
  },
  {
    id: '4',
    severity: 'warning',
    title: 'Ad set budget cap hit every day this week',
    description: '"Retargeting 30D" has hit its daily budget cap every single day for 7 days. Performance is strong.',
    estimatedImpact: 'Estimated $3,800 in missed revenue from budget constraints.',
    recommendedAction: 'Increase budget by 20–30%. ROAS is 4.1 — scaling is justified.',
    affectedEntity: 'Retargeting 30D',
  },
  {
    id: '5',
    severity: 'opportunity',
    title: 'High-ROAS campaign with room to scale',
    description: '"Interest Stack B" is producing 3.8 ROAS at only $45/day spend. Budget is nowhere near saturation.',
    estimatedImpact: 'Potential +$6,200 additional revenue at 4× current budget.',
    recommendedAction: 'Increase budget incrementally (20% every 48h) to avoid delivery reset.',
    affectedEntity: 'Interest Stack B',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────
const severityMeta: Record<Severity, { bar: string; badge: string; badgeText: string; icon: React.ReactNode }> = {
  critical:    { bar: 'bg-red-500',    badge: 'badge-critical',  badgeText: 'Critical',     icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  warning:     { bar: 'bg-amber-400',  badge: 'badge-warning',   badgeText: 'Warning',      icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  opportunity: { bar: 'bg-[#4f6ef7]', badge: 'badge-accent',    badgeText: 'Opportunity',  icon: <TrendingUp className="w-3.5 h-3.5" /> },
};

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const meta = severityMeta[insight.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card flex gap-0 overflow-hidden"
    >
      <div className={`w-1 shrink-0 ${meta.bar}`} />
      <div className="p-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`badge ${meta.badge} flex items-center gap-1`}>
              {meta.icon} {meta.badgeText}
            </span>
            {insight.affectedEntity && (
              <span className="text-xs text-[#535a65] truncate max-w-[160px]">{insight.affectedEntity}</span>
            )}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-[#f1f3f5] mb-2 leading-snug">{insight.title}</h3>
        <p className="text-xs text-[#8b92a0] leading-relaxed mb-3">{insight.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#8b92a0] bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5">
            <TrendingUp className="w-3 h-3 shrink-0" />
            <span className="font-medium">{insight.estimatedImpact}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8b92a0] bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5">
            <Zap className="w-3 h-3 shrink-0" />
            <span>{insight.recommendedAction}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HealthScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (1 - score / 100);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} strokeWidth="8" className="health-ring-track" />
        <circle
          cx="50" cy="50" r={radius} strokeWidth="8"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={filled}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function KpiTile({ label, value, subtext, color = 'default', tooltipContent, isLoading }: {
  label: string; value: React.ReactNode; subtext?: string;
  color?: 'default' | 'critical' | 'warning' | 'success' | 'accent';
  tooltipContent?: string;
  isLoading?: boolean;
}) {
  const colorMap = {
    default:  'text-[#f1f3f5]',
    critical: 'text-red-400',
    warning:  'text-amber-400',
    success:  'text-emerald-400',
    accent:   'text-[#818cf8]',
  };
  return (
    <div className="card p-4 relative group">
      <div className="flex items-center mb-2">
        <p className="stat-label mb-0">{label}</p>
        {tooltipContent && <InfoTooltip content={tooltipContent} />}
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-24 my-1 bg-white/5" />
      ) : (
        <p className={`text-2xl font-bold tracking-tight ${colorMap[color]}`}>{value}</p>
      )}
      {subtext && <p className="text-xs text-[#535a65] mt-1">{subtext}</p>}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function DashboardOverview() {
  const { activeAccount, dateRange, refreshTrigger, isDemoMode, syncStatus, setSyncStatus, lastSyncAt, setLastSyncAt, triggerRefresh } = useStore();
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [insightFilter, setInsightFilter] = useState<'all' | Severity>('all');

  // Account overview query — stable keys, no Date.now()
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['overview', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return null;
      const res = await analyticsApi.getOverview(activeAccount.id, dateRange.startDate, dateRange.endDate);
      return res.data;
    },
    enabled: !!activeAccount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns', activeAccount?.id, dateRange.startDate, dateRange.endDate, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return { list: [] };
      const res = await analyticsApi.getCampaigns(activeAccount.id, dateRange.startDate, dateRange.endDate, { limit: 10 });
      return res.data;
    },
    enabled: !!activeAccount,
    staleTime: 5 * 60 * 1000,
  });

  const campaigns = campaignsData?.list ?? [];

  // Health score derived from demo insights
  const criticalCount     = DEMO_INSIGHTS.filter(i => i.severity === 'critical').length;
  const warningCount      = DEMO_INSIGHTS.filter(i => i.severity === 'warning').length;
  const opportunityCount  = DEMO_INSIGHTS.filter(i => i.severity === 'opportunity').length;
  const healthScore       = Math.max(0, 100 - criticalCount * 15 - warningCount * 5);
  const spendAtRisk       = overview ? overview.spend * 0.18 : 3030;

  const filteredInsights = insightFilter === 'all'
    ? DEMO_INSIGHTS
    : DEMO_INSIGHTS.filter(i => i.severity === insightFilter);

  const handleSync = async () => {
    if (!activeAccount || syncState === 'loading') return;
    setSyncState('loading');
    setSyncStatus('RUNNING');
    try {
      await analyticsApi.triggerSync(activeAccount.id);
      setSyncState('success');
      setSyncStatus('COMPLETED');
      setLastSyncAt(new Date().toLocaleTimeString());
      triggerRefresh();
      setTimeout(() => setSyncState('idle'), 2500);
    } catch {
      setSyncState('failed');
      setSyncStatus('FAILED');
      setTimeout(() => setSyncState('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account Overview</h1>
          <p className="text-sm text-[#8b92a0] mt-1">
            {activeAccount ? activeAccount.name : 'No account connected'} ·{' '}
            {isDemoMode ? (
              <span className="text-amber-400 font-medium">Demo mode</span>
            ) : (
              <span className="text-emerald-400 font-medium">Live</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lastSyncAt && (
            <span className="text-xs text-[#535a65] hidden sm:block">
              Last sync: {lastSyncAt}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            state={syncState === 'loading' ? 'syncing' : syncState === 'success' ? 'success' : syncState === 'failed' ? 'failed' : 'idle'}
            loadingText="Syncing"
            successText="Synced"
            failedText="Failed"
            onClick={handleSync}
          >
            Sync
          </Button>
          {isDemoMode && (
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
              <Link href="/dashboard/settings">Connect account</Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Performance Chart ─────────────────────────────────────────────── */}
      <PerformanceChart />

      {/* ── Health + KPI row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Health score card */}
        <div className="card p-5 col-span-2 flex items-center gap-5">
          <HealthScoreRing score={healthScore} />
          <div>
            <p className="stat-label mb-1">Health Score</p>
            <p className="text-sm text-[#8b92a0] leading-snug">
              {healthScore >= 80
                ? 'Account is performing well.'
                : healthScore >= 60
                ? 'Some issues require attention.'
                : 'Immediate action required.'}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-[#8b92a0]">
              <span><span className="text-red-400 font-semibold">{criticalCount}</span> critical</span>
              <span><span className="text-amber-400 font-semibold">{warningCount}</span> warnings</span>
              <span><span className="text-[#818cf8] font-semibold">{opportunityCount}</span> opportunities</span>
            </div>
          </div>
        </div>

        <KpiTile
          label="Spend at Risk"
          value={formatCurrency(spendAtRisk)}
          subtext="from identified issues"
          color="critical"
          tooltipContent="Estimated potential loss based on current campaign performance issues."
          isLoading={overviewLoading}
        />
        <KpiTile
          label="Total Spend"
          value={formatCurrency(overview?.spend ?? 0)}
          subtext={dateRange.label}
          tooltipContent="Total amount spent across all active campaigns in the selected timeframe."
          isLoading={overviewLoading}
        />
        <KpiTile
          label="ROAS"
          value={formatRoas(overview?.roas ?? 0)}
          subtext="return on ad spend"
          color={( overview?.roas ?? 0) > 3 ? 'success' : 'default'}
          tooltipContent="Return on Ad Spend: Total conversion value divided by total spend."
          isLoading={overviewLoading}
        />
        <KpiTile
          label="Active Campaigns"
          value={campaigns.length}
          subtext="with spend this period"
          tooltipContent="Total number of campaigns that have incurred costs in the selected timeframe."
          isLoading={campaignsLoading}
        />
      </div>

      {/* ── Insights feed ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Audit Findings</h2>
            <p className="text-xs text-[#8b92a0] mt-0.5">
              {DEMO_INSIGHTS.length} issues found · prioritized by impact
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#111316] border border-white/[0.07] rounded-lg p-1">
            {(['all', 'critical', 'warning', 'opportunity'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setInsightFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-all font-medium capitalize ${
                  insightFilter === f
                    ? 'bg-white/[0.08] text-[#f1f3f5]'
                    : 'text-[#535a65] hover:text-[#8b92a0]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredInsights.map((insight, i) => (
            <InsightCard key={insight.id} insight={insight} index={i} />
          ))}
          {filteredInsights.length === 0 && (
            <div className="card p-8 text-center text-sm text-[#535a65]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              No {insightFilter} issues found.
            </div>
          )}
        </div>
      </div>

      {/* ── Campaigns table ───────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold">Campaign Performance</h2>
            <p className="text-xs text-[#8b92a0] mt-0.5">Top campaigns by spend</p>
          </div>
          <Link href="/dashboard/campaigns"
            className="text-xs text-[#8b92a0] hover:text-[#f1f3f5] flex items-center gap-1 transition-colors">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {campaignsLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center">
            <BarChart3 className="w-8 h-8 text-[#535a65] mx-auto mb-3" />
            <p className="text-sm text-[#535a65]">
              {isDemoMode ? 'No campaigns in demo data.' : 'No campaign data yet. Trigger a sync to import.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th className="text-right">Spend</th>
                <th className="text-right">ROAS</th>
                <th className="text-right">CPA</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 6).map((c: Record<string, unknown>) => {
                const roas = Number(c.roas ?? 0);
                const roasColor = roas >= 3 ? 'text-emerald-400' : roas >= 1.5 ? 'text-amber-400' : 'text-red-400';
                return (
                  <tr key={String(c.id)}>
                    <td>
                      <span className="text-[#f1f3f5] font-medium truncate max-w-[220px] block">
                        {String(c.name)}
                      </span>
                    </td>
                    <td className="text-right">{formatCurrency(Number(c.spend ?? 0))}</td>
                    <td className={`text-right font-semibold ${roasColor}`}>{formatRoas(roas)}</td>
                    <td className="text-right">{formatCurrency(Number(c.cpa ?? 0))}</td>
                    <td className="text-right">
                      <span className={`badge ${roas >= 1.5 ? 'badge-success' : 'badge-critical'}`}>
                        {roas >= 1.5 ? 'Healthy' : 'At risk'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
