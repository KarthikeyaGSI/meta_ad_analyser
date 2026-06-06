'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Key, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface DiagnosticStatus {
  status: 'ok' | 'error' | 'warning' | 'unknown';
  message: string;
}

interface DiagnosticsData {
  system: 'healthy' | 'unhealthy' | 'degraded';
  details: {
    database: DiagnosticStatus;
    auth: DiagnosticStatus;
    environment: DiagnosticStatus;
  };
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/diagnostics')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        setData({
          system: 'unhealthy',
          details: {
            database: { status: 'unknown', message: 'Failed to fetch status' },
            auth: { status: 'unknown', message: 'Failed to fetch status' },
            environment: { status: 'error', message: err.message || 'Network error fetching diagnostics' }
          }
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-8 h-8 text-gray-500 mb-4 animate-spin" />
          <p className="text-gray-400">Running system diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-[#818cf8]" />
              System Diagnostics
            </h1>
            <p className="text-gray-400 mt-2">Real-time health check for authentication and API services.</p>
          </div>
          <div className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 ${
            data?.system === 'healthy' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
            data?.system === 'unhealthy' ? 'bg-red-400/10 border-red-400/20 text-red-400' :
            'bg-amber-400/10 border-amber-400/20 text-amber-400'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              data?.system === 'healthy' ? 'bg-emerald-400' :
              data?.system === 'unhealthy' ? 'bg-red-400' :
              'bg-amber-400'
            }`} />
            System Status: {data?.system.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border flex items-start gap-4 ${getStatusColor(data?.details.database.status || 'unknown')}`}
          >
            <Database className="w-6 h-6 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 flex items-center gap-2">
                Neon Database Connection
                {getStatusIcon(data?.details.database.status || 'unknown')}
              </h3>
              <p className="text-sm opacity-90">{data?.details.database.message}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border flex items-start gap-4 ${getStatusColor(data?.details.auth.status || 'unknown')}`}
          >
            <Key className="w-6 h-6 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 flex items-center gap-2">
                Authentication Service (Better Auth)
                {getStatusIcon(data?.details.auth.status || 'unknown')}
              </h3>
              <p className="text-sm opacity-90">{data?.details.auth.message}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl border flex items-start gap-4 ${getStatusColor(data?.details.environment.status || 'unknown')}`}
          >
            <Server className="w-6 h-6 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 flex items-center gap-2">
                Environment Configuration
                {getStatusIcon(data?.details.environment.status || 'unknown')}
              </h3>
              <p className="text-sm opacity-90">{data?.details.environment.message}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
