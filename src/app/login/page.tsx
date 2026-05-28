'use client';

import { Account, OAuthProvider } from 'appwrite';
import { motion } from 'framer-motion';
import { Sparkles, Facebook, ArrowRight, BrainCircuit, BarChart3, Rocket, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { appwriteClient } from '../../server/appwrite/safeClient';
import { authApi } from '../../services/api';
import { useStore } from '../../store/useStore';

const account = new Account(appwriteClient);

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Triggers instant Aetheris JSON-DB Sandbox loading
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.guestLogin();
      setUser(res.data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Demo Sandbox failed to boot.');
      setLoading(false);
    }
  };

  // Triggers live Meta OAuth handshake redirection via Appwrite
  const handleMetaLogin = async () => {
    setLoading(true);
    setError('');
    try {
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
        throw new Error('No Appwrite credentials configured');
      }
      
      account.createOAuth2Session(
        OAuthProvider.Facebook,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/login`
      );
    } catch {
      console.warn('Appwrite OAuth failed or missing config. Auto-routing to Guest Sandbox Mode.');
      setError('Appwrite backend not fully configured. Routing to Sandbox Mode...');
      setTimeout(() => {
        handleGuestLogin();
      }, 1200);
    }
  };

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background spotlights */}
      <div className="glow-bg top-[-100px] left-[-100px] opacity-10"></div>
      <div className="glow-bg bottom-[-200px] right-[-100px] opacity-20" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 z-10">
        
        {/* LEFT COLUMN: HERO INFORMATION */}
        <div className="flex-1 text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Decision Intelligence SaaS for Meta Marketing
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight"
          >
            Auditing Meta Spend. <br/>
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-success bg-clip-text text-transparent">
              Scaling ROAS.
            </span>
          </motion.h1>

          <p className="text-muted text-base md:text-lg leading-relaxed max-w-md">
            Aetheris connects with your ad accounts to isolate audience ad fatigue, spot auction CPM spikes, and surface high-performing scaling opportunities using deterministic logic.
          </p>

          {/* SaaS Moat points */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-white/[0.06]">
            <div className="flex gap-2.5 items-start">
              <BrainCircuit className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Rule-Based AI</h4>
                <p className="text-[11px] text-muted">Deterministic anomaly indicators</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <BarChart3 className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Instant Sync</h4>
                <p className="text-[11px] text-muted">Aggregated analytics caches</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Rocket className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Scale Radar</h4>
                <p className="text-[11px] text-muted">Incrementally scale 20% budget</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Safe Sandbox</h4>
                <p className="text-[11px] text-muted">OAuth bypass development checks</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN WINDOW */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md glass-panel p-8 rounded-3xl relative overflow-hidden"
        >
          {/* Subtle logo inside the card */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-widest text-white">AETHERIS</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Connect Your Account</h2>
          <p className="text-xs text-muted leading-relaxed mb-6">
            Establish a connection to sync campaign metrics, placements breakdowns, and creative grids from the Meta marketing node.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-danger text-center">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            {/* Meta OAuth login button */}
            <button
              onClick={handleMetaLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/10 btn-touch disabled:opacity-50"
            >
              <Facebook className="w-5 h-5 fill-current" />
              {loading ? 'Initializing Connection...' : 'Connect Meta Business Account'}
            </button>

            <div className="flex items-center justify-between my-6">
              <div className="h-[1px] bg-white/[0.08] flex-1"></div>
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider px-3">or test the sandbox</span>
              <div className="h-[1px] bg-white/[0.08] flex-1"></div>
            </div>

            {/* Instant Demo Sandbox Access */}
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full group py-3 px-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 btn-touch disabled:opacity-50"
            >
              {loading ? 'Booting Sandbox...' : 'Explore Guest Sandbox Demo'}
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <p className="text-[10px] text-muted text-center leading-normal mt-6">
            Aetheris does not expose your long-lived access tokens to the frontend. Credentials are encrypted and isolated on our secure node.
          </p>
        </motion.div>

      </div>
    </main>
  );
}
