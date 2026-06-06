'use client';

import React from 'react';
import { Activity, Shield, Clock, Terminal, CheckCircle, ShieldAlert, MonitorSmartphone, Key } from 'lucide-react';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  // Mocking the calculated Health Score
  const healthScore = {
    status: 'At Risk', // Healthy, At Risk, Inactive
    daysActive: 45,
    connectedAccounts: 1,
    auditsGenerated: 2,
    loginsPastMonth: 3,
  };

  const timeline = [
    { action: 'Account Created', date: '45 days ago', icon: CheckCircle, color: 'text-emerald-400' },
    { action: 'License Activated', date: '44 days ago', icon: Key, color: 'text-indigo-400' },
    { action: 'Device Registered (MacBook Pro)', date: '44 days ago', icon: MonitorSmartphone, color: 'text-indigo-400' },
    { action: 'Audit Generated', date: '30 days ago', icon: Activity, color: 'text-neutral-400' },
    { action: 'Audit Generated', date: '15 days ago', icon: Activity, color: 'text-neutral-400' },
    { action: 'Grace Period Warning Sent', date: '2 days ago', icon: ShieldAlert, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white">Acme Corporation</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                healthScore.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                healthScore.status === 'At Risk' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                Health: {healthScore.status}
              </span>
            </div>
            <p className="text-neutral-400 mt-1 font-mono text-sm">Customer ID: {params.id}</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
              <Shield className="w-4 h-4" /> Impersonate User
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Health Metrics Sidebar */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-neutral-300">License Health Factors</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Days Active</span>
                  <span className="font-medium">{healthScore.daysActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Connected Accounts</span>
                  <span className="font-medium text-yellow-400">{healthScore.connectedAccounts} / 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Audits Generated</span>
                  <span className="font-medium text-red-400">{healthScore.auditsGenerated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Recent Logins</span>
                  <span className="font-medium">{healthScore.loginsPastMonth}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl">
              <h3 className="font-semibold mb-4 text-neutral-300">Internal Notes</h3>
              <textarea 
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-neutral-300 focus:outline-none focus:ring-1 focus:ring-white/20 h-32"
                defaultValue="Customer missed last payment. Sent grace period warning. Do not freeze yet; pending manual review with account exec."
              />
              <button className="mt-3 text-xs bg-neutral-800 text-white px-3 py-1.5 rounded-md hover:bg-neutral-700">Save Note</button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <h3 className="font-semibold text-neutral-300 flex items-center gap-2">
                  <Terminal className="w-5 h-5" /> Customer Timeline & Audit Trail
                </h3>
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900 text-neutral-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-neutral-950 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-medium text-white">{item.action}</div>
                        <time className="font-mono text-xs text-neutral-500">{item.date}</time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
