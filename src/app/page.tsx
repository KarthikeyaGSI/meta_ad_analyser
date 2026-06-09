'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, AlertTriangle, TrendingUp, BarChart3,
  CheckCircle2, Clock, Search, ChevronDown
} from 'lucide-react';
import { NetworkAnimation } from '@/components/ui/NetworkAnimation';

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FINDINGS = [
  {
    severity: 'critical',
    title: 'Audience fatigue in 3 ad sets',
    detail: 'Frequency > 4.2 on "Lookalike US 1%" — CPA has risen 34% over 14 days.',
    impact: '+$2,140 wasted spend / month',
    action: 'Pause and refresh creative',
  },
  {
    severity: 'critical',
    title: 'Zero-conversion campaign still spending',
    detail: '"Brand Awareness Q4" has spent $890 with 0 purchases in 21 days.',
    impact: '$890 unrecoverable spend',
    action: 'Pause campaign immediately',
  },
  {
    severity: 'warning',
    title: 'Rising CPM — auction pressure detected',
    detail: 'CPM increased 31% over 7 days without matching impression growth.',
    impact: 'Estimated +18% CPA if trend continues',
    action: 'Broaden target audience or shift placements',
  },
  {
    severity: 'opportunity',
    title: 'Underscaled winner identified',
    detail: '"Retargeting 30D" is at 4.1 ROAS with daily budget cap hit every day.',
    impact: 'Estimated +$3,800 revenue at 2× budget',
    action: 'Increase budget by 20–30%',
  },
];

const FAQS = [
  {
    q: 'How does Vero detect wasted ad spend?',
    a: 'Vero connects to your Meta Ads account via the official Graph API and applies a library of deterministic audit rules — checking for audience fatigue, zero-conversion spend, rising CPM anomalies, underscaled winners, and more. Every finding is mapped to an estimated dollar impact.',
  },
  {
    q: 'How often does Vero audit my account?',
    a: 'Audits run automatically after every data sync. By default, accounts sync every 6 hours. You can also trigger a manual audit at any time from the dashboard.',
  },
  {
    q: 'Is my Meta token stored securely?',
    a: 'Yes. Access tokens are encrypted at rest. Vero requests read-only permissions — we cannot modify your campaigns. All data is processed under SOC 2-compatible practices.',
  },
  {
    q: 'What is the Account Health Score?',
    a: 'It is a 0–100 composite score calculated from the number and severity of audit findings relative to your total active spend. A score above 80 means your account is healthy; below 60 signals immediate attention is needed.',
  },
  {
    q: 'Do you support Google Ads or TikTok?',
    a: 'Meta Ads is the current focus. Google Ads and TikTok Ads integrations are on the roadmap for H2 2025.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-[#f1f3f5]">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#535a65] shrink-0 ml-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-[#8b92a0] leading-relaxed border-t border-white/[0.05]">
          <div className="pt-4">{a}</div>
        </div>
      )}
    </div>
  );
}

const severityConfig = {
  critical:    { dot: 'bg-red-400',    badge: 'badge-critical',    label: 'Critical' },
  warning:     { dot: 'bg-amber-400',  badge: 'badge-warning',     label: 'Warning' },
  opportunity: { dot: 'bg-[#4f6ef7]', badge: 'badge-accent',      label: 'Opportunity' },
} as const;

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Vero',
        url: 'https://vero.ai',
        description: 'Automated Meta Ads audits and monitoring for agencies and performance marketers.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Vero',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: 'Automated Meta Ads audit and account health monitoring platform.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f1f3f5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0a0b0d]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4f6ef7] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">Vero</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['Product', 'Features', 'Security'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-[#8b92a0] hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-[#8b92a0] hover:text-white transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/dashboard/onboarding"
              className="h-9 px-4 bg-[#4f6ef7] hover:bg-[#3d5de0] text-white text-sm font-medium
                         rounded-lg flex items-center gap-1.5 transition-colors">
              Connect Meta Account
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <main>
      <section className="relative pt-48 pb-32 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Network Animation Background */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
          <NetworkAnimation color="#4f6ef7" particleCount={80} connectionDistance={180} />
        </div>
        
        {/* Radial gradient overlay to blend animation with background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0b0d_80%)] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
        <motion.div variants={FADE_UP} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#4f6ef7]
                           border border-[#4f6ef7]/30 bg-[#4f6ef7]/10 rounded-full px-4 py-2 mb-8 shadow-[0_0_15px_rgba(79,110,247,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#4f6ef7] animate-pulse" />
            Automated Meta Ads Audits & Monitoring
          </span>
        </motion.div>

        <motion.h1
          variants={FADE_UP} initial="hidden" animate="visible" custom={1}
          className="text-6xl md:text-[80px] font-bold tracking-tight leading-[1.1] mb-8 drop-shadow-2xl"
        >
          Stop Wasting <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f6ef7] to-[#809cf9]">Meta Ad Spend.</span>
        </motion.h1>

        <motion.p
          variants={FADE_UP} initial="hidden" animate="visible" custom={2}
          className="text-xl text-[#a1a8b6] max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Automatically detect performance issues, audience fatigue, rising costs, and missed
          scaling opportunities before they impact profitability.
        </motion.p>

        <motion.div
          variants={FADE_UP} initial="hidden" animate="visible" custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard/onboarding"
            className="h-14 px-8 bg-[#4f6ef7] hover:bg-[#3d5de0] text-white font-semibold text-base
                       rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center
                       shadow-[0_0_30px_rgba(79,110,247,0.4)] hover:shadow-[0_0_40px_rgba(79,110,247,0.6)] hover:-translate-y-0.5">
            Connect Meta Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/dashboard"
            className="h-14 px-8 bg-white/[0.05] hover:bg-white/[0.08] text-[#f1f3f5]
                       border border-white/[0.12] hover:border-white/[0.2] font-semibold text-base
                       rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center hover:-translate-y-0.5">
            View Demo Audit
          </Link>
        </motion.div>

        <motion.p
          variants={FADE_UP} initial="hidden" animate="visible" custom={4}
          className="mt-6 text-sm text-[#535a65] font-medium"
        >
          <ShieldCheck className="w-4 h-4 inline-block mr-1 text-emerald-500/80 mb-0.5" />
          Read-only access. No campaign modifications. Cancel anytime.
        </motion.p>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-medium text-[#535a65] uppercase tracking-widest mb-8">
            Used by growth teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale">
            {['Agencies', 'Media Buyers', 'DTC Brands', 'Ecommerce Teams', 'Consultants'].map((label) => (
              <span key={label} className="text-sm font-semibold text-[#8b92a0]">{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="product" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-3">Audit complete in 60 seconds</h2>
            <p className="text-[#8b92a0] text-base max-w-xl mx-auto">
              Connect your Meta account, we import the data, run the audit, and surface every issue immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: '01', icon: <Search className="w-5 h-5" />, title: 'Connect Meta', detail: 'Authorize read-only access to your Meta Ads account.' },
              { step: '02', icon: <Clock className="w-5 h-5" />, title: 'Import Data', detail: 'We pull all campaigns, ad sets, and 90 days of performance data.' },
              { step: '03', icon: <AlertTriangle className="w-5 h-5" />, title: 'Run Audit', detail: '40+ deterministic rules check for waste, fatigue, and missed opportunities.' },
              { step: '04', icon: <CheckCircle2 className="w-5 h-5" />, title: 'Get Findings', detail: 'Receive an Account Health Score and a prioritized list of actions.' },
            ].map(({ step, icon, title, detail }) => (
              <div key={step} className="card p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#8b92a0]">
                    {icon}
                  </div>
                  <span className="text-xs font-medium text-[#535a65]">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f1f3f5] mb-1">{title}</p>
                  <p className="text-xs text-[#8b92a0] leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Account Health Monitor ───────────────────────────────────────────── */}
      <section id="product" className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium text-[#4f6ef7] uppercase tracking-widest mb-4">Account Health</p>
              <h2 className="text-3xl font-semibold mb-5 leading-snug">
                Know the health of your account at a glance.
              </h2>
              <p className="text-[#8b92a0] leading-relaxed mb-8">
                The Account Health Score is a live composite metric that synthesizes every audit finding
                into a single number. Drop below 60 and you know it is time to act.
              </p>
              <ul className="space-y-3">
                {[
                  'Critical issues surfaced with exact dollar impact',
                  'Warnings show trends before they become costly',
                  'Opportunities quantify potential revenue gains',
                  'Score history tracks improvement over time',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#8b92a0]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Health score illustration */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                <div>
                  <p className="stat-label">Account Health Score</p>
                  <p className="stat-value mt-1">74<span className="text-xl text-[#535a65]">/100</span></p>
                </div>
                <span className="badge badge-warning">Needs attention</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Critical', value: '2', color: 'text-red-400' },
                  { label: 'Warnings', value: '3', color: 'text-amber-400' },
                  { label: 'Opportunities', value: '2', color: 'text-[#4f6ef7]' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-[11px] text-[#535a65] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { severity: 'critical', title: 'Audience fatigue in Lookalike US 1%', impact: '~$2,140/mo' },
                  { severity: 'warning', title: 'Rising CPM — auction pressure detected', impact: '+18% CPA' },
                  { severity: 'opportunity', title: 'Retargeting 30D hitting budget cap daily', impact: '+$3,800 revenue' },
                ].map(({ severity, title, impact }, i) => {
                  const { dot, badge, label } = severityConfig[severity as keyof typeof severityConfig];
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <div className={`status-dot ${dot} shrink-0`} />
                      <p className="text-xs text-[#8b92a0] flex-1 truncate">{title}</p>
                      <span className={`badge ${badge} shrink-0`}>{impact}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Example Findings ─────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3">What a typical audit finds</h2>
            <p className="text-[#8b92a0] max-w-xl mx-auto text-base">
              Real findings from real accounts. Every issue includes the root cause, estimated impact, and a concrete action.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FINDINGS.map(({ severity, title, detail, impact, action }, i) => {
              const { dot, badge, label } = severityConfig[severity as keyof typeof severityConfig];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="card p-5 flex gap-4"
                >
                  <div className={`severity-bar severity-${severity}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${badge}`}>{label}</span>
                    </div>
                    <p className="text-sm font-medium text-[#f1f3f5] mb-1">{title}</p>
                    <p className="text-xs text-[#8b92a0] leading-relaxed mb-3">{detail}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-white/[0.04] border border-white/[0.07] text-[#8b92a0] rounded-md px-2.5 py-1">
                        <TrendingUp className="w-3 h-3" /> {impact}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs bg-white/[0.04] border border-white/[0.07] text-[#8b92a0] rounded-md px-2.5 py-1">
                        <ArrowRight className="w-3 h-3" /> {action}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Security ─────────────────────────────────────────────────────────── */}
      <section id="security" className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3">Built for security-conscious teams</h2>
            <p className="text-[#8b92a0] max-w-xl mx-auto">
              We take a conservative approach to data access and retention.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Read-only Meta access', body: 'Vero requests the minimum permissions required. We can never create, pause, or modify your campaigns.' },
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Encrypted token storage', body: 'Access tokens are encrypted at rest using AES-256. They are never logged or exposed in client-side code.' },
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Meta API compliance', body: 'All data access adheres to Meta\'s Platform Terms and Data Policy. You can revoke access at any time from your Meta Business Manager.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="card p-6">
                <div className="mb-4">{icon}</div>
                <p className="text-sm font-medium text-[#f1f3f5] mb-2">{title}</p>
                <p className="text-xs text-[#8b92a0] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-5">Ready to audit your account?</h2>
          <p className="text-[#8b92a0] mb-8 text-base">
            Connect in 60 seconds. See your first findings immediately.
          </p>
          <Link href="/dashboard/onboarding"
            className="inline-flex items-center gap-2 h-12 px-8 bg-[#4f6ef7] hover:bg-[#3d5de0]
                       text-white font-medium text-sm rounded-xl transition-colors">
            Connect Meta Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs text-[#535a65]">
            Free to start. Limited onboarding spots available.
          </p>
        </div>
      </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#4f6ef7] flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">Vero</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#535a65]">
            <Link href="/privacy-policy" className="hover:text-[#8b92a0] transition-colors">Privacy</Link>
            <Link href="/terms-of-condition" className="hover:text-[#8b92a0] transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-[#8b92a0] transition-colors">FAQ</Link>
          </div>
          <p className="text-xs text-[#535a65]">© {new Date().getFullYear()} Vero Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
