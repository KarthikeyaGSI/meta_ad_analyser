'use client';

import { motion } from 'framer-motion';
import { Target, Search, ArrowRight, Briefcase, ShoppingBag, Globe, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../../../store/useStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { setAgencyName } = useStore();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');

  const niches = [
    { id: 'ecommerce', name: 'E-Commerce / D2C', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'saas', name: 'SaaS / Tech', icon: <Globe className="w-5 h-5" /> },
    { id: 'agency', name: 'Marketing Agency', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'info', name: 'Coaching / Info', icon: <BrainCircuit className="w-5 h-5" /> },
  ];

  const handleComplete = () => {
    if (businessName) {
      setAgencyName(businessName);
    }
    router.push('/dashboard');
  };

  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center">
      
      {/* STEP 1: Business Profile */}
      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-10 rounded-3xl space-y-8 relative overflow-hidden"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome to Vero Analytics</h1>
            <p className="text-muted">Let's tailor your dashboard to your specific industry and competitors.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">What is your business or agency name?</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Marketing"
              className="w-full max-w-md mx-auto block px-4 py-3 rounded-xl text-sm text-center text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">Select your primary niche</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {niches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNiche(n.id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                    niche === n.id 
                      ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {n.icon}
                  <span className="text-xs font-bold text-center">{n.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={() => setStep(2)}
              disabled={!niche || !businessName}
              className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Competitor Tracking */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-3xl space-y-8 relative overflow-hidden"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              Competitor Intelligence
            </h1>
            <p className="text-muted">Enter a primary competitor URL to instantly track their active ad creatives and estimated spend.</p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="e.g. competitor.com"
                className="w-full px-4 py-3 pl-12 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary leading-relaxed text-center">
                We'll use this domain to fetch active ads from the Meta Ad Library and predict their scaling strategy using our AI models.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              Generate Dashboard <BrainCircuit className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
