'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Activity, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function RootPage() {
  const [spendProtected, setSpendProtected] = useState(14502840);

  // Live ticking counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSpendProtected(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Vero</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#compare" className="hover:text-white transition">Vs Black-Box AI</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition">Log In</Link>
            <Link href="/dashboard/onboarding" className="px-5 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
              Start Audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6 relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 mb-8"
          >
            <ShieldCheck className="w-4 h-4 text-success" />
            Deterministic Guardrails for Scaling Brands
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8"
          >
            Stop Bleeding <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-slate-500">
              Meta Ad Budget.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12"
          >
            Skip the vague AI suggestions. Apply hard, deterministic rules that instantly pause fatigued ads, flag anomalies, and scale winning audiences—while you sleep.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard/onboarding" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-orange-600 text-white font-bold rounded-2xl text-lg transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2">
              Connect Meta Account <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl text-lg transition-all">
              View Demo Canvas
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-16 pt-10 border-t border-white/5"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Live Ad Spend Protected By Vero</p>
            <div className="text-4xl md:text-5xl font-mono font-black text-white/90 tracking-tight">
              ${spendProtected.toLocaleString()}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Split Comparison Section */}
      <section className="py-24 px-6 bg-black relative border-t border-white/5" id="compare">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Vero vs "Black-Box AI"</h2>
            <p className="text-slate-400 font-medium">Why top media buyers trust hard logic over generative fluff.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vague AI */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">Generic AI Analytics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-slate-400 font-medium font-mono">⚠️ "You should consider increasing your budget for Campaign A."</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-slate-400 font-medium font-mono">⚠️ "Audience overlap detected."</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-500 font-semibold uppercase tracking-wider">Result: You still have to log in and do the work.</p>
            </div>

            {/* Vero Logic */}
            <div className="glass-panel p-8 rounded-3xl border border-primary/20 bg-primary/[0.02] shadow-[0_0_50px_rgba(249,115,22,0.05)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Vero Execution Engine</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-success/20">
                  <p className="text-sm text-success font-medium font-mono">✓ 10:42 AM - Paused AdSet B (ROAS &lt; 1.2 and Spend &gt; $50)</p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-success/20">
                  <p className="text-sm text-success font-medium font-mono">✓ 14:15 PM - Scaled Campaign A budget by +15% (3-Day ROAS &gt; 3.0)</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-primary font-semibold uppercase tracking-wider">Result: Money saved. Sleep restored.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <ShieldAlert className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Run a Free "Shadow Audit"</h2>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            Connect your Meta account in read-only mode. We'll scan your last 30 days and show you exactly how much money our guardrails would have saved you. No credit card required.
          </p>
          <div className="pt-8">
            <Link href="/dashboard/onboarding" className="px-10 py-5 bg-white hover:bg-slate-200 text-black font-black rounded-2xl text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] inline-flex items-center gap-3">
              Generate Bleed Report <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
