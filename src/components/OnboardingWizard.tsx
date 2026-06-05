'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Building, Users, Server, Sparkles, Check, ArrowRight } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const createOrg = useMutation(api.organizations.create);
  const createWorkspace = useMutation(api.workspaces.create);
  
  // Note: in a real environment, we'd persist the organizationId to our user session after creation
  const [createdOrgId, setCreatedOrgId] = useState<Id<"organizations"> | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const orgId = await createOrg({ name: orgName, slug });
      setCreatedOrgId(orgId);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrgId) return;
    
    setLoading(true);
    try {
      await createWorkspace({ 
        organizationId: createdOrgId,
        name: workspaceName,
        description: "Initial Workspace"
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]" />
      
      <div className="relative w-full max-w-2xl p-8">
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
            
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  s < step ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 
                  s === step ? 'bg-indigo-500/20 border-2 border-indigo-500 text-indigo-400' : 
                  'bg-[#111] border-2 border-white/10 text-white/40'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Create Organization */}
        {step === 1 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-500">
            <header className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create your Organization</h2>
              <p className="text-white/60">This is your top-level company container.</p>
            </header>

            <form onSubmit={handleCreateOrg} className="space-y-6">
              <fieldset className="space-y-6 border-none p-0 m-0">
                <legend className="sr-only">Create Organization</legend>
                <div>
                  <label htmlFor="org-name" className="sr-only">Organization Name</label>
                  <input
                    id="org-name"
                    required
                    aria-required="true"
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all text-center"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !orgName}
                  aria-label="Create Organization and Continue"
                  className="w-full bg-white text-black font-medium px-6 py-4 rounded-xl transition-all hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Continue'}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </fieldset>
            </form>
          </section>
        )}

        {/* Step 2: Create Workspace */}
        {step === 2 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-500" aria-label="Step 2: Create Workspace">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <Server className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Set up your Workspace</h2>
              <p className="text-white/60">Workspaces isolate data for different teams or clients.</p>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <fieldset className="space-y-6 border-none p-0 m-0">
                <legend className="sr-only">Create Workspace</legend>
                <div>
                  <label htmlFor="workspace-name" className="sr-only">Workspace Name</label>
                  <input
                    id="workspace-name"
                    required
                    aria-required="true"
                    type="text"
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all text-center"
                    placeholder="e.g. Marketing Team"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !workspaceName}
                  aria-label="Create Workspace and Continue"
                  className="w-full bg-white text-black font-medium px-6 py-4 rounded-xl transition-all hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Continue'}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </fieldset>
            </form>
          </section>
        )}

        {/* Step 3: Connect Account */}
        {step === 3 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-500 text-center" aria-label="Step 3: Connect Account">
            <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Connect your Meta Account</h2>
            <p className="text-white/60 mb-8">We'll scan your last 30 days of data to find wasted spend.</p>
            
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => { setLoading(false); setStep(4); }, 1500); // Mock connection delay
              }}
              aria-label="Connect Meta"
              className="w-full bg-blue-600 text-white font-medium px-6 py-4 rounded-xl transition-all hover:bg-blue-500 flex items-center justify-center gap-2 mb-4 cursor-pointer"
            >
              {loading ? 'Connecting...' : 'Connect Meta Ads'}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setStep(4)}
              className="text-sm text-white/40 hover:text-white"
            >
              Skip for now
            </button>
          </section>
        )}

        {/* Step 4: Historical Audit (The "Aha!" Moment) */}
        {step === 4 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-500" aria-label="Step 4: Historical Audit">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Historical Audit Complete</h2>
              <p className="text-emerald-400/80 font-medium">We scanned your last 30 days of ad spend.</p>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">If Vero's guardrails were active last month:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">You would have saved <span className="text-emerald-400 font-bold">$1,240.00</span></p>
                    <p className="text-sm text-white/50">By pausing 4 fatigued ad sets that exceeded frequency limits.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">You would have captured <span className="text-emerald-400 font-bold">12% more ROAS</span></p>
                    <p className="text-sm text-white/50">By instantly scaling 2 winning audiences when CPA dropped.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => setStep(5)}
              className="w-full bg-white text-black font-medium px-6 py-4 rounded-xl transition-all hover:bg-white/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </section>
        )}

        {/* Step 5: Invite Team */}
        {step === 5 && (
          <section className="animate-in fade-in slide-in-from-right-8 duration-500 text-center" aria-label="Step 5: Invite Team">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Invite your Team</h2>
            <p className="text-white/60 mb-8">SaaS works better together.</p>
            
            <button
              onClick={onComplete}
              aria-label="Finish Onboarding"
              className="w-full bg-white text-black font-medium px-6 py-4 rounded-xl transition-all hover:bg-white/90 flex items-center justify-center gap-2 cursor-pointer"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
