'use client';

import React from 'react';
import { Activity, Users, ShieldAlert, Zap, Server, Shield, Sparkles, CheckCircle2, Building } from 'lucide-react';

export default function CustomerSuccessDashboard() {
  const activeOrgId = 'mock-org-1';
  
  const data: any = {
    activationPercentage: 80,
    adoptionPercentage: 65,
    usagePercentage: 90,
    healthScore: 'Excellent',
    metrics: { workspaces: 1, teamSize: 5, apiCalls: 100, premiumRequested: true }
  };

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" aria-label="Customer Success Metrics">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold text-white tracking-tight">Customer Success</h1>
          <p className="text-white/60 mt-2">Track your workspace activation and adoption metrics.</p>
        </header>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel-premium p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 mb-4 relative">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl" aria-hidden="true">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Activation Score</h3>
          </div>
          <div className="text-4xl font-bold text-white">{data.activationPercentage}%</div>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${data.activationPercentage}%` }} />
          </div>
        </div>

        <div className="glass-panel-premium p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 mb-4 relative">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl" aria-hidden="true">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Adoption Rate</h3>
          </div>
          <div className="text-4xl font-bold text-white">{data.adoptionPercentage}%</div>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${data.adoptionPercentage}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
