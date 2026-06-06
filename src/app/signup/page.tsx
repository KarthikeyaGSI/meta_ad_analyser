'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/client/lib/auth-client';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password
      });

      if (error) {
        throw new Error(error.message || 'Failed to create account');
      }

      setStatus('success');
      setTimeout(() => {
        router.push('/activation');
      }, 1000);
      
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <h1 className="text-2xl font-semibold text-center mb-2 tracking-tight">Create an Account</h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Join Vero and unlock the ultimate ad intelligence platform.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder:text-gray-600"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder:text-gray-600"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder:text-gray-600"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>

          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div 
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
            disabled={status === 'loading' || status === 'success' || !name || !email || !password}
            className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mt-6"
          >
            <AnimatePresence mode="wait">
              {status === 'idle' || status === 'error' ? (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              ) : status === 'loading' ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 text-gray-600"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-green-600"
                >
                  <span>Success!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Already have an account? <Link href="/login" className="text-white hover:underline transition-all">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
