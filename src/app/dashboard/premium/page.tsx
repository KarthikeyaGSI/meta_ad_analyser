'use client';

import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { RequestPremiumModal } from '../../../client/components/RequestPremiumModal';

export default function PremiumDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const activeOrgId = 'mock-org-1';
  const statusRecord: any = null;

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
            aria-label="Open Premium Request Modal"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            Request Premium Access
          </button>
        </div>
      ) : (
        <div className="glass-panel-premium p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Your Request Status</h2>
          <div className="relative">
             <div className="pt-1">
               <h3 className="text-white font-medium">Request Submitted</h3>
             </div>
          </div>
        </div>
      )}

      {activeOrgId && (
        <RequestPremiumModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          organizationId={activeOrgId}
        />
      )}
    </div>
  );
}
