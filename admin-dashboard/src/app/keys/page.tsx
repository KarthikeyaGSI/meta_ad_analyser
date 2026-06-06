'use client';

import React, { useState, useEffect } from 'react';
import { generateActivationKey, getPlans } from './actions';
import { Key, Copy, Check, Shield } from 'lucide-react';
import Link from 'next/link';

export default function KeysPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ rawKey?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await generateActivationKey(formData);
    
    setResult(res);
    setLoading(false);
  };

  const copyKey = () => {
    if (result?.rawKey) {
      navigator.clipboard.writeText(result.rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center">
              <Key className="w-8 h-8 mr-3 text-purple-400" />
              Activation Keys
            </h1>
            <p className="text-neutral-400 mt-1">Generate time-limited license keys for customers</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg hover:bg-neutral-800 transition-colors">
            Back to Dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl">
            <h2 className="text-xl font-medium mb-6">Create New Key</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Select Plan</label>
                <select name="planId" className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  <option value="">Default Plan</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.billingPeriod})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Time Limit (Days)</label>
                <select name="durationDays" className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  <option value="7">7 Days (Trial)</option>
                  <option value="30">30 Days (Monthly)</option>
                  <option value="365">365 Days (Yearly)</option>
                  <option value="3650">Lifetime (10 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Max Seats (Users)</label>
                <input type="number" name="maxSeats" defaultValue="1" min="1" max="999" className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Key'}
              </button>
            </form>
          </div>

          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl flex flex-col justify-center items-center text-center">
            {result?.rawKey ? (
              <div className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
                <Shield className="w-12 h-12 text-green-400 mx-auto" />
                <h3 className="text-xl font-medium">Key Generated Successfully!</h3>
                <p className="text-sm text-neutral-400">Share this raw key with your customer. They must enter it on the /activation page.</p>
                <div className="flex items-center space-x-2 bg-neutral-950 border border-green-500/30 p-4 rounded-lg">
                  <code className="text-green-400 flex-1 text-left font-mono tracking-wider">{result.rawKey}</code>
                  <button onClick={copyKey} className="p-2 hover:bg-white/10 rounded-md transition-colors text-neutral-300">
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm p-3 rounded-lg text-left">
                  <strong>Important:</strong> This is the ONLY time this key will be shown. We only store the hash for security purposes.
                </div>
              </div>
            ) : result?.error ? (
              <div className="text-red-400 bg-red-400/10 p-4 rounded-lg border border-red-400/20 w-full text-left">
                Error: {result.error}
              </div>
            ) : (
              <div className="text-neutral-500 flex flex-col items-center">
                <Key className="w-16 h-16 opacity-20 mb-4" />
                <p>Generate a key to see it here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
