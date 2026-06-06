'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// convex import removed
// convex import removed
// convex import removed
import {
  BarChart3, CheckCircle2, ArrowRight, Loader2,
  Link2, DatabaseZap, Scan, ShieldCheck, TrendingUp
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: 'Connect Meta',    icon: Link2 },
  { id: 2, label: 'Import Account',  icon: DatabaseZap },
  { id: 3, label: 'Run Audit',       icon: Scan },
  { id: 4, label: 'Health Score',    icon: ShieldCheck },
  { id: 5, label: 'View Findings',   icon: TrendingUp },
];

const SLIDE = {
  enter:  { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);

  const createOrg = async (opts: any) => 'mock';
  const createWorkspace = async (opts: any) => 'mock';

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const slug  = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const orgId = await createOrg({ name: orgName.trim(), slug });
      setCreatedOrgId(orgId);

      // Create a default workspace
      await createWorkspace({
        organizationId: orgId,
        name: `${orgName.trim()} — Main`,
        description: 'Default workspace',
      });
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create organization.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMeta = () => {
    // In production: redirect to Meta OAuth
    setStep(3);
    simulateAudit();
  };

  const simulateAudit = () => {
    setAuditProgress(0);
    const interval = setInterval(() => {
      setAuditProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep(4), 400);
          return 100;
        }
        return prev + 4;
      });
    }, 60);
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map(({ id, label }) => (
        <React.Fragment key={id}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              id < step  ? 'bg-emerald-500 text-white' :
              id === step ? 'bg-[#4f6ef7] text-white' :
              'bg-white/[0.06] text-[#535a65]'
            }`}>
              {id < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : id}
            </div>
            {id === step && (
              <span className="text-xs font-medium text-[#f1f3f5] hidden sm:block">{label}</span>
            )}
          </div>
          {id < STEPS.length && (
            <div className={`h-px flex-1 min-w-[16px] transition-colors duration-300 ${id < step ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-[#4f6ef7] flex items-center justify-center">
            <BarChart3 className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#f1f3f5]">Vero</span>
        </div>

        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* ── Step 1: Create org ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.section key="step-1" variants={SLIDE} initial="enter" animate="center" exit="exit">
              <h1 className="text-2xl font-semibold mb-2">Set up your account</h1>
              <p className="text-sm text-[#8b92a0] mb-8">
                You will be auditing Meta Ads for this organization. You can add more teams later.
              </p>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-[#8b92a0] mb-2">
                    Organization name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Media Agency"
                    className="input"
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading || !orgName.trim()}
                  className="w-full h-11 bg-[#4f6ef7] hover:bg-[#3d5de0] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Creating…' : 'Continue'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </motion.section>
          )}

          {/* ── Step 2: Connect Meta ────────────────────────────────────── */}
          {step === 2 && (
            <motion.section key="step-2" variants={SLIDE} initial="enter" animate="center" exit="exit">
              <h1 className="text-2xl font-semibold mb-2">Connect your Meta account</h1>
              <p className="text-sm text-[#8b92a0] mb-8">
                Vero requests read-only access. We cannot modify your campaigns. You can revoke access at any time.
              </p>
              <div className="card p-4 mb-6 space-y-2">
                {[
                  'Read campaign performance data',
                  'Access ad set and creative metrics',
                  'View audience insights',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-[#8b92a0]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </div>
                ))}
                <div className="divider my-3" />
                <p className="text-xs text-[#535a65]">
                  Permissions requested: <code className="text-[#8b92a0]">ads_read</code>, <code className="text-[#8b92a0]">ads_management</code> (read-only)
                </p>
              </div>
              <button
                onClick={handleConnectMeta}
                className="w-full h-11 bg-[#1877F2] hover:bg-[#1467d2] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Meta
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full mt-3 text-xs text-[#535a65] hover:text-[#8b92a0] transition-colors py-2"
              >
                Skip for now — connect later in Settings
              </button>
            </motion.section>
          )}

          {/* ── Step 3: Running audit ────────────────────────────────────── */}
          {step === 3 && (
            <motion.section key="step-3" variants={SLIDE} initial="enter" animate="center" exit="exit" className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#4f6ef7]/10 border border-[#4f6ef7]/20 flex items-center justify-center mx-auto mb-6">
                <Scan className="w-8 h-8 text-[#818cf8]" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Auditing your account</h1>
              <p className="text-sm text-[#8b92a0] mb-8">
                Checking 40+ performance rules across your campaigns, ad sets, and creatives.
              </p>
              <div className="card p-4 mb-4 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#8b92a0]">Audit progress</span>
                  <span className="text-xs font-semibold text-[#f1f3f5]">{auditProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#4f6ef7] rounded-full"
                    style={{ width: `${auditProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="mt-4 space-y-1.5">
                  {[
                    { label: 'Campaign performance data', done: auditProgress > 20 },
                    { label: 'Audience fatigue signals',  done: auditProgress > 45 },
                    { label: 'CPM & CPA anomalies',       done: auditProgress > 65 },
                    { label: 'Scaling opportunities',     done: auditProgress > 85 },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-[#535a65]">
                      {done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <div className="w-3.5 h-3.5 rounded-full border border-white/[0.1]" />
                      }
                      <span className={done ? 'text-[#8b92a0]' : ''}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Step 4: Health score ─────────────────────────────────────── */}
          {step === 4 && (
            <motion.section key="step-4" variants={SLIDE} initial="enter" animate="center" exit="exit">
              <h1 className="text-2xl font-semibold mb-2">Your Account Health Score</h1>
              <p className="text-sm text-[#8b92a0] mb-8">
                We found several issues that are costing you money. Here is what matters most.
              </p>
              <div className="card p-5 mb-4">
                <div className="flex items-center gap-5 mb-5 pb-5 border-b border-white/[0.06]">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-400">74</div>
                    <div className="text-xs text-[#535a65] mt-1">out of 100</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f1f3f5] mb-1">Needs attention</p>
                    <p className="text-xs text-[#8b92a0] leading-relaxed">
                      2 critical issues are actively wasting ad spend. We estimate <span className="text-red-400 font-medium">$3,030 at risk</span> this month.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { dot: 'bg-red-400',    label: '2 Critical issues',   sub: 'Audience fatigue + zero-conversion campaign' },
                    { dot: 'bg-amber-400',  label: '3 Warnings',          sub: 'Rising CPM, budget constraints' },
                    { dot: 'bg-[#4f6ef7]', label: '2 Opportunities',     sub: 'Scalable campaigns identified' },
                  ].map(({ dot, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`status-dot ${dot}`} />
                      <div>
                        <span className="text-sm font-medium text-[#f1f3f5]">{label}</span>
                        <span className="text-xs text-[#535a65] ml-2">{sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(5)}
                className="w-full h-11 bg-[#4f6ef7] hover:bg-[#3d5de0] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                See all findings <ArrowRight className="w-4 h-4" />
              </button>
            </motion.section>
          )}

          {/* ── Step 5: Complete ─────────────────────────────────────────── */}
          {step === 5 && (
            <motion.section key="step-5" variants={SLIDE} initial="enter" animate="center" exit="exit" className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">You are ready</h1>
              <p className="text-sm text-[#8b92a0] mb-8 max-w-sm mx-auto">
                Your audit is complete. Head to your dashboard to review every finding and start saving ad spend.
              </p>
              <button
                onClick={onComplete}
                className="w-full h-11 bg-[#4f6ef7] hover:bg-[#3d5de0] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
