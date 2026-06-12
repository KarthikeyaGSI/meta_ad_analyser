'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/client/lib/auth-client';
import Link from 'next/link';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in" // better-auth defaults to 'sign-in'
      });

      if (error) {
        throw new Error(error.message || 'Failed to send OTP');
      }

      setStatus('idle');
      setStep('otp');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Network error: The authentication service is unavailable.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email,
        otp
      });

      if (error) {
        throw new Error(error.message || 'Invalid OTP code');
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
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
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
            {step === 'email' ? 'Enter your email to receive a login code' : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all placeholder:text-gray-600"
                  disabled={status === 'loading'}
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
                disabled={status === 'loading' || !email}
                className="w-full bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  'Send Login Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                <input 
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all placeholder:text-gray-600"
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
                disabled={status === 'loading' || status === 'success' || !otp}
                className="w-full bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm flex items-center justify-center transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {status === 'idle' || status === 'error' ? (
                  'Verify & Log In'
                ) : status === 'loading' ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Success'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => { setStep('email'); setStatus('idle'); setOtp(''); setErrorMessage(''); }}
                className="w-full mt-4 text-xs text-gray-500 hover:text-white transition-colors"
                disabled={status === 'loading' || status === 'success'}
              >
                ← Back to email
              </button>
            </form>
          )}
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
