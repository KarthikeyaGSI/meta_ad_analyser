'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/client/lib/auth-client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password
      });

      if (error) {
        throw new Error(error.message || 'Invalid credentials');
      }

      // Attempt to sync their existing license into a cookie
      try {
        await fetch('/api/license/sync', { method: 'POST' });
      } catch (e) {
        // Silently fail, middleware will catch them
      }

      setStatus('success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (err: any) {
      setStatus('error');
      
      let msg = err.message || 'An unknown error occurred';
      
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network error')) {
        msg = 'Network error: The authentication service is unavailable or unreachable.';
      } else if (msg.toLowerCase().includes('invalid')) {
        msg = 'Invalid email or password.';
      }
      
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-white rounded-lg mx-auto mb-6 flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-100">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your credentials to access your workspace
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all placeholder:text-gray-600"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all placeholder:text-gray-600"
                disabled={status === 'loading' || status === 'success'}
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
              disabled={status === 'loading' || status === 'success' || !email || !password}
              className="w-full bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {status === 'idle' || status === 'error' ? (
                'Sign In'
              ) : status === 'loading' ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Success'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link href="/signup" className="text-gray-300 hover:text-white transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
