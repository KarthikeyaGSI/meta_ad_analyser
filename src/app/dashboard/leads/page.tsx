'use client';

import { Users, MapPin, DollarSign, Target } from 'lucide-react';
import React from 'react';
import leadsData from '../../../shared/data/leadsData.json';
import { formatCurrency } from '../../../shared/utils/formatters';

export default function LeadsDashboard() {
  const totalLeads = leadsData.length;
  const totalCost = leadsData.reduce((sum, lead) => sum + lead.cost, 0);
  const avgCpl = totalLeads > 0 ? totalCost / totalLeads : 0;
  
  const convertedLeads = leadsData.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> Leads Intelligence
          </h1>
          <p className="text-muted text-sm mt-1">Track lead acquisition cost and regional distribution.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
            <h3 className="text-sm font-semibold text-muted">Total Leads</h3>
          </div>
          <p className="text-2xl font-bold text-white">{totalLeads}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/20 rounded-lg"><DollarSign className="w-5 h-5 text-success" /></div>
            <h3 className="text-sm font-semibold text-muted">Average CPL</h3>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(avgCpl)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/20 rounded-lg"><Target className="w-5 h-5 text-warning" /></div>
            <h3 className="text-sm font-semibold text-muted">Conversion Rate</h3>
          </div>
          <p className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info/20 rounded-lg"><MapPin className="w-5 h-5 text-info" /></div>
            <h3 className="text-sm font-semibold text-muted">Top Region</h3>
          </div>
          <p className="text-2xl font-bold text-white">Hyderabad</p>
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Recent Leads (Telangana Real Estate)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Lead ID</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Region</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Campaign</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leadsData.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm text-white font-medium">{lead.id}</td>
                  <td className="p-4 text-sm text-muted">{lead.name}</td>
                  <td className="p-4 text-sm text-muted">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {lead.region}</span>
                  </td>
                  <td className="p-4 text-sm text-muted">{lead.campaign}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lead.status === 'Converted' ? 'bg-success/20 text-success' : 
                      lead.status === 'Qualified' ? 'bg-info/20 text-info' : 
                      lead.status === 'Lost' ? 'bg-danger/20 text-danger' : 
                      'bg-white/10 text-muted'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-white font-semibold text-right">{formatCurrency(lead.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
