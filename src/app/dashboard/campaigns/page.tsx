'use client';

import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { analyticsApi } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercent, formatRoas, formatNumber } from '../../../utils/formatters';
import { Search, ChevronUp, ChevronDown, Download, AlertTriangle, Play, Pause, Layers } from 'lucide-react';

export default function CampaignsExplorer() {
  const { activeAccount, dateRange, refreshTrigger } = useStore();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [sortBy, setSortBy] = useState('spend');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 1. Fetch campaigns from API using the current query filters
  const { data: tableData, isLoading } = useQuery({
    queryKey: ['campaignsTable', activeAccount?.id, dateRange.startDate, dateRange.endDate, search, status, sortBy, sortOrder, page, refreshTrigger],
    queryFn: async () => {
      if (!activeAccount) return { list: [], total: 0 };
      const res = await analyticsApi.getCampaigns(activeAccount.id, dateRange.startDate, dateRange.endDate, {
        search,
        status,
        sortBy,
        sortOrder,
        page,
        limit
      });
      return res.data;
    },
    enabled: !!activeAccount,
  });

  const campaignList = tableData?.list || [];
  const totalCount = tableData?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Sorting Handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Sort Icon Renderer
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-primary ml-1" /> : <ChevronDown className="w-3.5 h-3.5 text-primary ml-1" />;
  };

  // Triggers backend CSV exporter download
  const handleCsvExport = () => {
    if (!activeAccount) return;
    const url = analyticsApi.exportCsvUrl(activeAccount.id, dateRange.startDate, dateRange.endDate);
    window.open(url, '_blank');
  };

  return (
    <>
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Campaign Explorer <Layers className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-sm text-muted">Analyze, filter, and sort campaign assets from your connected accounts.</p>
        </div>
        
        {/* CSV Export Button */}
        <button
          onClick={handleCsvExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-glow-primary self-start"
        >
          <Download className="w-4 h-4" />
          Export CSV Report
        </button>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] focus:border-primary/50 text-xs text-white placeholder-muted focus:outline-none transition"
          />
        </div>

        {/* Status Category Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-muted font-bold mr-2 hidden md:inline">Status:</span>
          <div className="flex p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.07]">
            {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((s) => {
              const selected = status === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1 rounded text-[10px] font-bold tracking-wider transition ${
                    selected ? 'bg-primary text-white shadow-glow-primary' : 'text-muted hover:text-white'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN TABLE FRAME */}
      <div className="glass-panel rounded-3xl relative overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th onClick={() => handleSort('name')} className="px-6 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none min-w-[280px]">
                  <div className="flex items-center">Campaign Name {renderSortIcon('name')}</div>
                </th>
                <th className="px-4 py-4.5 text-xs font-bold text-muted select-none">Status</th>
                <th onClick={() => handleSort('spend')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">Spend {renderSortIcon('spend')}</div>
                </th>
                <th onClick={() => handleSort('roas')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">ROAS {renderSortIcon('roas')}</div>
                </th>
                <th onClick={() => handleSort('purchases')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">Purchases {renderSortIcon('purchases')}</div>
                </th>
                <th onClick={() => handleSort('ctr')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">CTR {renderSortIcon('ctr')}</div>
                </th>
                <th onClick={() => handleSort('cpc')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">CPC {renderSortIcon('cpc')}</div>
                </th>
                <th onClick={() => handleSort('cpa')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">CPA {renderSortIcon('cpa')}</div>
                </th>
                <th onClick={() => handleSort('impressions')} className="px-4 py-4.5 text-xs font-bold text-muted cursor-pointer hover:text-white transition select-none text-right">
                  <div className="flex items-center justify-end">Impressions {renderSortIcon('impressions')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, idx) => (
                  <tr key={idx} className="border-b border-white/[0.04] animate-pulse">
                    <td className="px-6 py-5"><div className="w-56 h-4.5 bg-white/10 rounded"></div></td>
                    <td className="px-4 py-5"><div className="w-16 h-4 bg-white/10 rounded"></div></td>
                    <td className="px-4 py-5" colSpan={7}><div className="h-4.5 bg-white/10 rounded w-full"></div></td>
                  </tr>
                ))
              ) : (campaignList || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-warning" />
                      <span className="text-sm font-semibold">No campaigns matched your filters in this range.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                (campaignList || []).map((camp: any) => {
                  const isActive = camp.status.toUpperCase() === 'ACTIVE';
                  
                  return (
                    <tr key={camp.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4.5 font-semibold text-xs text-white max-w-[340px] truncate group-hover:text-primary transition-colors">
                        {camp.name}
                        <p className="text-[10px] text-muted font-normal mt-0.5">{camp.campaignId}</p>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-4.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isActive 
                            ? 'text-success bg-success/15 border border-success/20' 
                            : 'text-muted bg-white/[0.04] border border-white/[0.07]'
                        }`}>
                          {isActive ? <Play className="w-2 h-2 fill-current" /> : <Pause className="w-2 h-2 fill-current" />}
                          {camp.status}
                        </span>
                      </td>

                      {/* Spend */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatCurrency(camp.spend)}
                      </td>

                      {/* ROAS */}
                      <td className={`px-4 py-4.5 text-xs font-black text-right ${camp.roas >= 2.5 ? 'text-success' : camp.roas < 1.3 ? 'text-danger' : 'text-white'}`}>
                        {formatRoas(camp.roas)}
                      </td>

                      {/* Purchases */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatNumber(camp.purchases)}
                      </td>

                      {/* CTR */}
                      <td className="px-4 py-4.5 text-xs text-white font-semibold text-right">
                        {formatPercent(camp.ctr)}
                      </td>

                      {/* CPC */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatCurrency(camp.cpc)}
                      </td>

                      {/* CPA */}
                      <td className="px-4 py-4.5 text-xs text-white font-medium text-right">
                        {formatCurrency(camp.cpa)}
                      </td>

                      {/* Impressions */}
                      <td className="px-4 py-4.5 text-xs text-muted font-medium text-right">
                        {formatNumber(camp.impressions)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION TOOLBAR */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4.5 border-t border-white/[0.06] bg-white/[0.005]">
            <span className="text-xs text-muted">
              Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-white">{Math.min(page * limit, totalCount)}</span> of <span className="font-semibold text-white">{totalCount}</span> campaigns
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-xs font-bold text-white transition disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-muted px-2">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-xs font-bold text-white transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
