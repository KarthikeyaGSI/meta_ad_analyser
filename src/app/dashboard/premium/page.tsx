'use client';

import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { RequestPremiumModal } from '../../../components/RequestPremiumModal';
// Hardcoding a dummy org ID for now, since we haven't integrated Clerk deeply yet
// In production, we fetch this from `useOrganization()` or similar
const dummyOrgId = "jh770d1s4q2p8g0j4z9b22y8v9738m25" as Id<"organizations">;

export default function PremiumDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusRecord = useQuery(api.premium.getStatus, { organizationId: dummyOrgId });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">Premium Access</h1>
      </div>

      {!statusRecord ? (
        <div className="glass-panel-premium p-12 text-center rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
            <Sparkles className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Unlock Enterprise Features</h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8 text-lg">
            Get access to white-labeling, custom domains, advanced API access, dedicated account management, and deep CRM integrations.
          </p>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Request Premium Access
          </button>
        </div>
      ) : (
        <div className="glass-panel-premium p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Your Request Status</h2>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10" />
            
            <div className="space-y-8 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-16 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center z-10">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-white font-medium">Request Submitted</h3>
                  <p className="text-sm text-white/50 mt-1">We received your premium application.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-16 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${statusRecord.status === 'pending' ? 'bg-[#111] border-white/20' : 'bg-indigo-500/20 border-indigo-500'}`}>
                    {statusRecord.status !== 'pending' ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : <Clock className="w-4 h-4 text-white/40" />}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className={`font-medium ${statusRecord.status === 'pending' ? 'text-white/60' : 'text-white'}`}>Review in Progress</h3>
                  <p className="text-sm text-white/50 mt-1">Our team is reviewing your requirements.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-16 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${['pending', 'contacted', 'qualified'].includes(statusRecord.status) ? 'bg-[#111] border-white/20' : 'bg-green-500/20 border-green-500'}`}>
                    {statusRecord.status === 'converted' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Sparkles className="w-4 h-4 text-white/40" />}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className={`font-medium ${['pending', 'contacted', 'qualified'].includes(statusRecord.status) ? 'text-white/60' : 'text-white'}`}>Premium Activated</h3>
                  <p className="text-sm text-white/50 mt-1">You have full access to enterprise features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <RequestPremiumModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        organizationId={dummyOrgId}
      />
    </div>
  );
}
