'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Facebook, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ConnectMetaPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      setStatus('error');
      setErrorMessage(error);
      toast.error(`Connection failed: ${error}`);
    } else if (success) {
      setStatus('success');
      toast.success('Successfully connected to Meta Ads');
    }
  }, [searchParams]);

  const handleConnect = () => {
    window.location.href = '/api/auth/meta';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
        <p className="text-gray-500 mt-2">Connect your advertising platforms to Vero to start analyzing campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black border border-white/10 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Facebook className="w-24 h-24 text-blue-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Facebook className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Meta Ads</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-8 max-w-[280px]">
              Connect your Facebook and Instagram ad accounts to automatically sync campaign data, creative assets, and performance metrics.
            </p>

            {status === 'success' ? (
              <div className="flex items-center space-x-2 text-green-500 bg-green-500/10 px-4 py-3 rounded-lg border border-green-500/20 w-fit">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Connected successfully</span>
              </div>
            ) : status === 'error' ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
                <button 
                  onClick={handleConnect}
                  className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <span>Try Again</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 group/btn"
              >
                <span>Connect Account</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
