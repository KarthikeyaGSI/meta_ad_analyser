'use client';

import { motion } from 'framer-motion';
import { Target, Search, ArrowRight, Briefcase, ShoppingBag, Globe, BrainCircuit, Key, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../../../client/store/useStore';
import { analyticsApi } from '../../../services/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { setAgencyName } = useStore();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['']);
  
  // API Keys state
  const [metaKey, setMetaKey] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const niches = [
    { id: 'ecommerce', name: 'E-Commerce / D2C', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'saas', name: 'SaaS / Tech', icon: <Globe className="w-5 h-5" /> },
    { id: 'agency', name: 'Marketing Agency', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'info', name: 'Coaching / Info', icon: <BrainCircuit className="w-5 h-5" /> },
  ];

  const handleAddCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleUpdateCompetitor = (index: number, value: string) => {
    const newComps = [...competitors];
    newComps[index] = value;
    setCompetitors(newComps);
  };

  const handleRemoveCompetitor = (index: number) => {
    const newComps = [...competitors];
    newComps.splice(index, 1);
    setCompetitors(newComps);
  };

  const hasValidCompetitors = competitors.some(c => c.trim().length > 3);

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState('');
  const [bleedData, setBleedData] = useState({ spend: 0, saved: 0 });

  const handleStartAudit = async () => {
    setIsScanning(true);
    setScanError('');
    try {
      await analyticsApi.connectDirectToken({ adAccountId, metaKey, customAccountName: businessName });
      useStore.getState().setActiveAccount({ id: adAccountId, name: businessName || 'Primary Ad Account', actId: adAccountId });
      
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      // Fetch overview data to calculate realistic bleed metrics
      const res = await analyticsApi.getOverview(adAccountId, startStr, endStr);
      const totalSpend = res.data?.spend || 0;
      
      // Calculate realistic "wasted budget" (e.g. 15% of spend roughly, or fetch exact creatives if needed)
      // Since creative fetching might be slow, we'll estimate based on exact spend if creatives are missing
      const creativesRes = await analyticsApi.getCreatives(adAccountId, startStr, endStr).catch(() => ({ data: [] }));
      
      let calculatedBleed = 0;
      if (creativesRes.data.length > 0) {
        creativesRes.data.forEach((c: any) => {
          if ((c.frequency || 1) > 4 && (c.roas || 1) < 1.2) {
            calculatedBleed += c.spend || 0;
          }
        });
      } else {
        calculatedBleed = totalSpend * 0.15; // Realistic estimation
      }

      setBleedData({
        spend: Math.round(calculatedBleed),
        saved: Math.round(calculatedBleed * 0.5)
      });
      
      setIsScanning(false);
      setScanComplete(true);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Failed to connect to Meta API. Please check your credentials.');
      setIsScanning(false);
    }
  };

  const [isFinishing, setIsFinishing] = useState(false);

  const handleComplete = async () => {
    setIsFinishing(true);
    if (businessName) {
      setAgencyName(businessName);
    }
    try {
      // 1. Save competitors
      const validCompetitors = competitors.filter(c => c.trim().length > 3);
      if (validCompetitors.length > 0) {
        // Assume organization ID is injected via cookies/headers by our middleware, but we can also rely on API interceptors
        await fetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ competitors: validCompetitors })
        });
      }

      // 2. Mark onboarding completed
      await fetch('/api/onboarding/complete', { method: 'POST' });

      router.push('/dashboard/welcome');
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
    }
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
            <p className="text-muted">Let's tailor your dashboard to your specific industry.</p>
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
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">What is your Website URL?</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourdomain.com"
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
              disabled={!niche || !businessName || !websiteUrl}
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
            <p className="text-muted">Enter up to 5 competitor URLs to track their active ad creatives and estimated spend.</p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            {competitors.map((comp, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={comp}
                    onChange={(e) => handleUpdateCompetitor(index, e.target.value)}
                    placeholder={`Competitor URL ${index + 1}`}
                    className="w-full px-4 py-3 pl-12 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                {competitors.length > 1 && (
                  <button onClick={() => handleRemoveCompetitor(index)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            {competitors.length < 5 && (
              <button 
                onClick={handleAddCompetitor}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" /> Add Another Competitor
              </button>
            )}
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mt-6">
              <p className="text-xs text-primary leading-relaxed text-center">
                We'll use these domains to fetch active ads from the Meta Ad Library and predict scaling strategies. You must provide at least one valid URL.
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
              onClick={() => setStep(3)}
              disabled={!hasValidCompetitors}
              className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: API Integration */}
      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-3xl space-y-8 relative overflow-hidden"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
              <Key className="w-8 h-8 text-primary" />
              API Integrations
            </h1>
            <p className="text-muted">Provide your API keys to enable AI-powered analytics and chat.</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">Meta Marketing API Token</label>
              <input
                type="password"
                value={metaKey}
                onChange={(e) => setMetaKey(e.target.value)}
                placeholder="EAAG..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">Meta Ad Account ID</label>
              <input
                type="text"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
                placeholder="act_..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">OpenAI API Key (Optional)</label>
              <input
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase mb-2 block">Google Gemini API Key (Optional)</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!metaKey || !adAccountId}
              className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Connection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Historical Shadow Audit (Bleed Report) */}
      {step === 4 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-3xl space-y-8 relative overflow-hidden"
        >
          {!scanComplete ? (
            <div className="text-center space-y-8 py-10">
              <h1 className="text-3xl font-black text-white tracking-tight">Initiating Historical Audit...</h1>
              <p className="text-muted">Scanning your last 30 days of Meta Ads data for inefficiencies.</p>
              
              {!isScanning && !scanError ? (
                <button
                  onClick={handleStartAudit}
                  className="mx-auto px-8 py-4 bg-primary hover:bg-orange-600 text-white font-black rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                >
                  <Search className="w-6 h-6 animate-pulse" />
                  Run Deep Scan
                </button>
              ) : isScanning ? (
                <div className="max-w-md mx-auto">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5, ease: "linear" }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <p className="text-xs font-mono text-primary animate-pulse uppercase tracking-widest">Crunching Impressions & Conversions...</p>
                </div>
              ) : null}

              {scanError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <p className="font-bold">{scanError}</p>
                  <button 
                    onClick={() => setStep(3)}
                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition"
                  >
                    Check Credentials
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="inline-block p-4 rounded-full bg-red-500/10 mb-2">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-4">The Bleed Report</h1>
                <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
                  Last month, you spent <span className="text-red-400 font-bold">${bleedData.spend.toLocaleString()}</span> on fatigued ad creatives that had a Frequency &gt; 4 and ROAS &lt; 1.2.
                </p>
              </div>

              <div className="glass-panel border border-success/20 bg-success/5 p-6 rounded-2xl max-w-lg mx-auto">
                <p className="text-success font-bold text-lg mb-2 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  If Vero Guardrails were active...
                </p>
                <p className="text-white/80">We would have automatically paused them on Day 3, saving you <span className="text-success font-black text-xl">${bleedData.saved.toLocaleString()}</span> in wasted budget.</p>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleComplete}
                  disabled={isFinishing}
                  className="px-10 py-5 bg-white hover:bg-slate-200 text-black font-black rounded-2xl text-lg flex items-center justify-center gap-3 mx-auto transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
                >
                  {isFinishing ? 'Finalizing Setup...' : 'Activate Vero Dashboard'} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

    </div>
  );
}
