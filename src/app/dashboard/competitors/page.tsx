'use client';

import { motion } from 'framer-motion';
import { Target, Search, Plus, Eye, TrendingUp, AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';

const dummyCompetitors = [
  { id: 1, name: 'Gymshark', url: 'gymshark.com', activeAds: 142, estSpend: '$450k/mo', trend: '+12%', longestAd: '45 days', newAdsThisWeek: 18 },
  { id: 2, name: 'Alo Yoga', url: 'aloyoga.com', activeAds: 89, estSpend: '$210k/mo', trend: '-5%', longestAd: '120 days', newAdsThisWeek: 4 },
  { id: 3, name: 'Lululemon', url: 'lululemon.com', activeAds: 312, estSpend: '$1.2M/mo', trend: '+2%', longestAd: '210 days', newAdsThisWeek: 45 },
];

export default function CompetitorsPage() {
  const { isPremium } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isPremium) return null;

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Competitor Ad Tracking
          </h1>
          <p className="text-muted mt-1">Spy on competitor ad libraries, track new creatives, and estimate their spend.</p>
        </div>
        
        <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center gap-2 transition-colors border border-white/10">
          <Plus className="w-4 h-4" />
          Track Competitor
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tracked competitors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-white/5">
          {dummyCompetitors.map((comp, idx) => (
            <motion.div 
              key={comp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.02] transition-colors gap-6"
            >
              <div className="flex items-center gap-4 w-full md:w-1/4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xl text-primary border border-white/10">
                  {comp.name[0]}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    {comp.name}
                    <a href={`https://${comp.url}`} target="_blank" rel="noreferrer" className="text-white/30 hover:text-primary transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </h3>
                  <p className="text-muted text-sm">{comp.url}</p>
                </div>
              </div>

              <div className="flex flex-1 justify-between w-full">
                <div className="text-center">
                  <p className="text-muted text-xs uppercase font-bold tracking-wider mb-1">Active Ads</p>
                  <p className="text-white font-bold text-xl">{comp.activeAds}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs uppercase font-bold tracking-wider mb-1">Est. Spend</p>
                  <div className="flex items-center gap-2 justify-center">
                    <p className="text-white font-bold text-xl">{comp.estSpend}</p>
                    <span className={`text-xs font-bold ${comp.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {comp.trend}
                    </span>
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <p className="text-muted text-xs uppercase font-bold tracking-wider mb-1">Longest Ad</p>
                  <p className="text-white font-bold text-xl">{comp.longestAd}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Ads
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-primary/20 to-transparent p-[1px] rounded-2xl">
        <div className="bg-surface rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">New Competitor Alert</h3>
              <p className="text-muted text-sm">Gymshark just launched 18 new ad creatives in the last 24 hours.</p>
            </div>
          </div>
          <button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors shrink-0">
            Analyze Creatives
          </button>
        </div>
      </div>
    </div>
  );
}
