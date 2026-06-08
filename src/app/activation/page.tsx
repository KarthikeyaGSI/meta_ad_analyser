'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ActivationPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setStatus('validating');
    setErrorMessage('');

    try {
      // Fingerprinting in a real scenario would use a library like FingerprintJS
      const deviceFingerprint = navigator.userAgent + '-' + window.screen.width;

      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey, deviceFingerprint })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid license key');
      }

      setStatus('success');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-6 flex items-center justify-center">
            <Key className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-100">Activate License</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your license key to unlock your workspace
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-[#111] border border-white/10 text-gray-400 text-xs p-3 rounded-lg mb-6 text-center">
            <strong>Local Dev:</strong> Use <code className="bg-black border border-white/10 px-1 py-0.5 rounded">DEV-KEY-123</code> to bypass
          </div>
        )}

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">License Key</label>
              <input 
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="VERO-XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all placeholder:text-gray-600 uppercase"
                disabled={status === 'validating' || status === 'success'}
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={status === 'validating' || status === 'success' || !licenseKey.trim()}
              className="w-full bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {status === 'idle' || status === 'error' ? (
                'Activate License'
              ) : status === 'validating' ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activated Successfully</span>
                </div>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need a license? <a href="#" className="text-gray-300 hover:text-white transition-colors">Purchase a plan</a> or <a href="#" className="text-gray-300 hover:text-white transition-colors">contact sales</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
