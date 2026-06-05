'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Activity, Users, ShieldAlert, Zap, Server, Shield, Sparkles, CheckCircle2, Building } from 'lucide-react';

export default function CustomerSuccessDashboard() {
  const orgs = useQuery(api.organizations.listForUser);
  const activeOrgId = orgs?.[0]?._id;
  
  const data = useQuery(api.success.getActivationScore, 
    activeOrgId ? { organizationId: activeOrgId } : "skip"
  );

  if (!data) {
    return <div className="animate-pulse flex space-x-4" aria-busy="true" aria-label="Loading metrics"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-white/10 rounded w-1/4"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-24 bg-white/10 rounded col-span-1"></div><div className="h-24 bg-white/10 rounded col-span-1"></div><div className="h-24 bg-white/10 rounded col-span-1"></div></div></div></div></div>;
  }

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

        <div className="glass-panel-premium p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 mb-4 relative">
            <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl" aria-hidden="true">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Usage Level</h3>
          </div>
          <div className="text-4xl font-bold text-white">{data.usagePercentage}%</div>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${data.usagePercentage}%` }} />
          </div>
        </div>

        <div className="glass-panel-premium p-6 rounded-2xl relative overflow-hidden group flex flex-col justify-between">
          <div>
            <h3 className="text-white/60 font-medium mb-2">Overall Health</h3>
            <div className={`text-2xl font-bold ${data.healthScore === 'Excellent' ? 'text-green-400' : data.healthScore === 'Good' ? 'text-yellow-400' : 'text-red-400'}`}>
              {data.healthScore}
            </div>
          </div>
          <p className="text-sm text-white/40">Based on team engagement and platform usage.</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-10 mb-4">Activation Checklist</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Organization Created', done: true, icon: Building },
          { label: 'Workspace Created', done: data.metrics.workspaces > 0, icon: Server },
          { label: 'Team Invited', done: data.metrics.teamSize > 1, icon: Users },
          { label: 'Feature Usage Logged', done: data.metrics.apiCalls > 0, icon: Activity },
          { label: 'Premium Requested', done: data.metrics.premiumRequested, icon: Sparkles },
        ].map((item, i) => (
          <li key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${item.done ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/10'}`}>
            <div className={`p-2 rounded-lg ${item.done ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/40'}`} aria-hidden="true">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-white font-medium">{item.label}</div>
            {item.done && <CheckCircle2 className="w-5 h-5 text-indigo-400" aria-label="Completed" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
