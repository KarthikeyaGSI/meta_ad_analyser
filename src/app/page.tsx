'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Search, Activity, Target, Zap, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { NetworkBackground } from '../components/ui/NetworkBackground';

export default function RootPage() {
  const [demoUrl, setDemoUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleDemoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl) return;
    setIsSearching(true);
    setTimeout(() => {
      // Direct to onboarding with prefilled data in a real app
      window.location.href = '/dashboard/onboarding';
    }, 800);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Vero',
        url: 'https://vero.yourdomain.com',
        logo: 'https://vero.yourdomain.com/logo.png',
        description: 'Vero discovers hidden advertising intelligence and winning Meta ad patterns.'
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Vero Ad Intelligence',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Vero?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Vero is a Meta ad intelligence platform that analyzes winning active ads, tracks competitors, and discovers scalable creative patterns.'
            }
          },
          {
            '@type': 'Question',
            name: 'Who is this for?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Performance marketers, media buyers, DTC brands, and agencies looking for a competitive edge in their ad campaigns.'
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 font-sans overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Vero</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#demo" className="hover:text-white transition">Product Tour</a>
            <a href="#features" className="hover:text-white transition">Capabilities</a>
            <a href="#premium" className="hover:text-white transition">Premium</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">Sign In</Link>
            <Link href="/dashboard/premium" className="hidden sm:flex px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-sm transition-all items-center gap-2">
              Apply for Premium
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative min-h-[90vh] flex flex-col items-center justify-center">
        <NetworkBackground />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 mb-8 backdrop-blur-md"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            The Ultimate Advertising Intelligence Network
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] mb-8"
          >
            See Which Meta Ads Are Winning <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
              Before Your Competitors Do.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed mb-12"
          >
            Analyze active Meta ads, discover creative patterns, uncover winning hooks, and make faster campaign decisions using real advertising intelligence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard/onboarding" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-200 text-black font-bold rounded-2xl text-lg transition-all flex items-center justify-center gap-2">
              Analyze Ads <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard/premium" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl text-lg transition-all flex items-center justify-center gap-2 group">
              Apply for Premium Access
            </Link>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest"
          >
            Limited onboarding spots available.
          </motion.p>
        </div>
      </main>

      {/* Product-Led Demo Section */}
      <section id="demo" className="py-24 px-6 relative z-10 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Instant Intelligence Demo</h2>
            <p className="text-slate-400">Enter any competitor's brand name or Meta Ad Library URL to instantly reveal their strategy.</p>
          </div>
          
          <div className="glass-panel p-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative">
            <form onSubmit={handleDemoSearch} className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="e.g. Gymshark, AG1, or paste URL..." 
                  className="w-full h-14 bg-transparent pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none text-lg"
                />
              </div>
              <button 
                type="submit"
                className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                disabled={isSearching}
              >
                {isSearching ? 'Analyzing Network...' : 'Reveal Ads'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Trusted By Industry Leaders</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="text-xl font-black">Agencies</span>
            <span className="text-xl font-black">Performance Marketers</span>
            <span className="text-xl font-black">Media Buyers</span>
            <span className="text-xl font-black">DTC Brands</span>
            <span className="text-xl font-black">Consultants</span>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="features" className="py-32 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Discover the Unseen.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Vero maps the competitive landscape so you don't have to guess what works.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <Target className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Winning Ads Discovery</h3>
              <p className="text-slate-400 leading-relaxed">Instantly identify which creatives are driving the most volume for your competitors. Stop wasting budget on untested angles.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <Activity className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Competitor Intelligence</h3>
              <p className="text-slate-400 leading-relaxed">Track brands in real-time. Know exactly when they launch new campaigns, scale budgets, or pivot their messaging.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
              <Cpu className="w-8 h-8 text-orange-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Creative Pattern Analysis</h3>
              <p className="text-slate-400 leading-relaxed">Extract the underlying frameworks of viral ads. We break down the hooks, the offers, and the exact visual language that converts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section id="premium" className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <ShieldCheck className="w-16 h-16 text-indigo-500 mx-auto" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Enterprise Intelligence</h2>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            Scale your agency with white-label reports, API access, and dedicated data pipelines. Get the infrastructure you need to outpace the market.
          </p>
          <div className="pt-8">
            <Link href="/dashboard/premium" className="px-10 py-5 bg-white hover:bg-slate-200 text-black font-black rounded-2xl text-lg transition-all inline-flex items-center gap-3">
              Apply for Premium Access <ArrowUpRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / FAQ / Final CTA */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <span className="font-bold">Vero Intelligence</span>
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Vero Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
