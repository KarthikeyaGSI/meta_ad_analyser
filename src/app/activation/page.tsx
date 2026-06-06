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
      // Set cookie to satisfy middleware (using a simple document.cookie for client-side demo, better handled via API response Set-Cookie)
      document.cookie = "vero.license_valid=true; path=/; max-age=86400";
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients typical of Linear/Vercel */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-white/5 border border-white/10 rounded-xl mb-6 mx-auto">
          <Key className="w-6 h-6 text-gray-300" />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-2 tracking-tight">Activate Your License</h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Enter your license key to unlock the Vero platform and access your workspace.
        </p>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">License Key</label>
            <input 
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="VERO-XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder:text-gray-600 uppercase"
              disabled={status === 'validating' || status === 'success'}
            />
          </div>

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div 
                key="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={status === 'validating' || status === 'success' || !licenseKey.trim()}
            className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {status === 'idle' || status === 'error' ? (
                <motion.span 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <span>Activate License</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              ) : status === 'validating' ? (
                <motion.span 
                  key="validating"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </motion.span>
              ) : (
                <motion.span 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-green-600"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activated Successfully</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Need a license? <a href="#" className="text-white hover:underline transition-all">Purchase a plan</a> or <a href="#" className="text-white hover:underline transition-all">contact sales</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
