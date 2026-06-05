'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Shield, Users, Building, Sparkles, Activity, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const organizations = useQuery(api.admin.getAllOrganizations);
  const requests = useQuery(api.admin.getAllPremiumRequests);
  const updateStatus = useMutation(api.admin.updatePremiumRequestStatus);

  const [activeTab, setActiveTab] = useState<'requests' | 'organizations'>('requests');

  const handleApproveRequest = async (requestId: Id<"premiumRequests">) => {
    await updateStatus({ requestId, status: 'converted' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Admin</h1>
            <p className="text-white/60">Platform-wide management and oversight.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'requests' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Premium Requests
        </button>
        <button 
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === 'organizations' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Organizations
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {!requests ? (
            <div className="text-white/50">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="glass-panel-premium p-12 text-center rounded-2xl">
              <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="text-white font-medium text-lg">No pending requests</h3>
            </div>
          ) : (
            requests.map(req => (
              <div key={req._id} className="glass-panel-premium p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{req.company}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      req.status === 'converted' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                      req.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                      'bg-white/10 border-white/20 text-white/60'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{req.name}</span>
                    <span>•</span>
                    <span>{req.email}</span>
                    <span>•</span>
                    <span>{req.teamSize} employees</span>
                  </div>
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/80">
                    <span className="text-white/40 block mb-1">Requirements:</span>
                    {req.requirements}
                  </div>
                </div>
                
                {req.status === 'pending' && (
                  <button 
                    onClick={() => handleApproveRequest(req._id)}
                    className="bg-green-500 hover:bg-green-400 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!organizations ? (
            <div className="text-white/50">Loading organizations...</div>
          ) : (
            organizations.map(org => (
              <div key={org._id} className="glass-panel-premium p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Building className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${org.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {org.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{org.name}</h3>
                <p className="text-white/50 text-sm mb-4">Slug: {org.slug}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-white/40">Plan: <strong className="text-white/80 uppercase">{org.plan}</strong></span>
                  <span className="text-xs text-white/40">White Label: <strong className="text-white/80">{org.whiteLabelEnabled ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
