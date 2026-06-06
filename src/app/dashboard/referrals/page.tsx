'use client';

import React, { useState } from 'react';
// import { useQuery, useMutation } from 'convex/react';
// import { api } from '@convex/_generated/api';
import { Share2, Users, Gift, Link2, Copy, CheckCircle2 } from 'lucide-react';

export default function ReferralsDashboard() {
  const code = 'MOCK-CODE';
  const referrals: any[] = [];
  const generateCode = async () => 'NEW-CODE';
  
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(`https://app.example.com/signup?ref=${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerate = () => {
    generateCode();
  };

  const stats = {
    clicks: referrals?.length ? referrals.length * 3 : 0, // Mock clicks based on signups
    signups: referrals?.length || 0,
    conversions: referrals?.filter(r => r.status === 'completed').length || 0
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Referrals</h1>
          <p className="text-white/60 mt-2">Invite friends and earn rewards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-premium p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Link Clicks</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.clicks}</div>
        </div>

        <div className="glass-panel-premium p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Total Signups</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.signups}</div>
        </div>

        <div className="glass-panel-premium p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="text-white/60 font-medium">Conversions</h3>
          </div>
          <div className="text-4xl font-bold text-white">{stats.conversions}</div>
        </div>
      </div>

      <div className="glass-panel-premium p-8 rounded-2xl max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Your Referral Link</h2>
        
        {!code ? (
          <button 
            onClick={handleGenerate}
            aria-label="Generate My Referral Link"
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            Generate My Referral Link
          </button>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center gap-3">
              <Link2 className="w-5 h-5 text-white/40" />
              <span className="truncate">https://app.example.com/signup?ref={code}</span>
            </div>
            <button 
              onClick={handleCopy}
              aria-label={copied ? "Link copied" : "Copy referral link"}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium border border-white/10 cursor-pointer"
            >
              {copied ? <><CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" /> Copied!</> : <><Copy className="w-4 h-4" aria-hidden="true" /> Copy</>}
            </button>
          </div>
        )}

        <div className="mt-6 text-sm text-white/50">
          Share this link with your network. When someone signs up and activates Premium, you both earn platform credits.
        </div>
      </div>
    </div>
  );
}
