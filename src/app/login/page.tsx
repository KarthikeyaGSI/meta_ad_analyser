'use client';

import { Account, OAuthProvider } from 'appwrite';
import { motion } from 'framer-motion';
import { Sparkles, Facebook, ArrowRight, BrainCircuit, BarChart3, Rocket, ShieldCheck, Mail, Apple } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { authApi } from '../../services/api';
import NeumorphismButton from '../../components/NeumorphismButton';
import { appwriteClient } from '../../server/appwrite/safeClient';

const account = new Account(appwriteClient);

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Triggers instant Vero JSON-DB Sandbox loading
  const handleGuestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.guestLogin();
      setUser(res.data || { id: 'demo_user', name: 'Demo User', token: 'demo_token' });
      router.push('/dashboard/onboarding'); // Redirect to new onboarding flow
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Account temporarily suspended due to security lockout.');
        setLoading(false);
        return;
      }
      console.warn('Sandbox API route failed, performing automated client-side fallback login:', err);
      setUser({ id: 'demo_user', name: 'Demo User', token: 'demo_token' });
      router.push('/dashboard/onboarding');
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // First try to login
      try {
        const res = await authApi.login({ email, password });
        const resData = res.data as any;
        setUser({
          token: resData.token,
          id: resData.user?.id || 'user_id',
          name: resData.user?.name || email.split('@')[0],
          email: email
        });
        router.push('/dashboard/onboarding');
      } catch (loginErr: any) {
        // If login fails, try to register
        if (loginErr.response?.status === 401 || loginErr.response?.status === 404) {
          const regRes = await authApi.register({ email, password, name: email.split('@')[0] });
          const regResData = regRes.data as any;
          setUser({
            token: regResData.token,
            id: regResData.user?.id || 'user_id',
            name: regResData.user?.name || email.split('@')[0],
            email: email
          });
          router.push('/dashboard/onboarding');
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Account temporarily suspended due to security lockout.');
      } else {
        setError('Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setLoading(true);
    setError('');
    // Simulate generic OAuth onboarding
    setTimeout(() => {
      setUser({ id: `demo_${provider}`, name: `${provider} User`, token: `token_${provider}` });
      router.push('/dashboard/onboarding');
    }, 1000);
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
            <span className="bg-gradient-to-r from-primary via-orange-400 to-success bg-clip-text text-transparent">
              Scaling ROAS.
            </span>
          </motion.h1>

          <p className="text-muted text-base md:text-lg leading-relaxed max-w-md">
            Vero connects with your ad accounts to isolate audience ad fatigue, spot auction CPM spikes, and surface high-performing scaling opportunities using deterministic logic.
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
              <Rocket className="w-5 h-5 text-orange-400 mt-0.5" />
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
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-widest text-white">VERO</span>
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

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <fieldset className="space-y-4 border-none p-0 m-0">
              <legend className="sr-only">Login with Email</legend>
              <div>
                <label htmlFor="email-input" className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="admin@vero.co"
                />
              </div>
              <div>
                <label htmlFor="password-input" className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input
                  id="password-input"
                  type="password"
                  required
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder="••••••••"
                />
              </div>
              <NeumorphismButton
                type="submit"
                disabled={loading}
                className="w-full"
                aria-label="Sign in with Email"
              >
                {loading ? 'Authenticating...' : 'Sign In with Email'}
              </NeumorphismButton>
            </fieldset>
          </form>

          <div className="flex items-center justify-between my-4">
            <div className="h-[1px] bg-white/[0.08] flex-1"></div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider px-3">or continue with</span>
            <div className="h-[1px] bg-white/[0.08] flex-1"></div>
          </div>

          <div className="space-y-3.5">
            {/* Google OAuth login button */}
            <button
              onClick={() => handleOAuthLogin('Google')}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold bg-white text-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2.5 shadow-lg btn-touch disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Initializing...' : 'Continue with Google'}
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

          <div className="mt-6 space-y-2 text-center">
            <p className="text-[10px] text-muted leading-normal">
              Vero does not expose your long-lived access tokens to the frontend. Credentials are encrypted and isolated on our secure node.
            </p>
            <div className="flex flex-col items-center justify-center gap-2 text-[10px] text-white/40">
              <div className="flex gap-4">
                <a href="/" className="hover:text-primary transition-colors">Home Page</a>
                <span>•</span>
                <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="/terms-of-condition" className="hover:text-primary transition-colors">Terms of Condition</a>
              </div>
              <div className="flex gap-3 mt-1 pt-1 border-t border-white/10">
                <span className="opacity-60">Connect with Founder:</span>
                <a href="https://marketingko.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">MarketingKO</a>
                <a href="https://linktr.ee/karthikeyathallapally" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Linktree</a>
                <a href="https://www.youtube.com/@karthikeyathallapally" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">YouTube</a>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
