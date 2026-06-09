"use client";
import React, { useState } from 'react';
import { analyticsApi } from '@/services/api';

/**
 * Admin page for configuring Meta integration credentials.
 * It allows entering the Meta Access Token and Account ID, then persists
 * them via the `/api/meta/store` endpoint.
 */
export default function MetaSettings() {
  const [accessToken, setAccessToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setMessage('');
    try {
      const res = await fetch('/api/meta/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'TODO_ORG_ID', // replace with actual org ID context
          metaAccessToken: accessToken,
          metaAccountId: accountId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Meta credentials saved successfully.');
        // Optionally refresh UI or invalidate cache
        analyticsApi.refetch?.();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    }
  };

  return (
    <section className="glass-panel p-6 rounded-3xl space-y-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-white">Meta Integration Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted mb-1" htmlFor="access-token">
            Meta Access Token
          </label>
          <input
            id="access-token"
            type="password"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white focus:outline-none focus:border-primary"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1" htmlFor="account-id">
            Meta Account ID (act_...)
          </label>
          <input
            id="account-id"
            type="text"
            className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white focus:outline-none focus:border-primary"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save Meta Settings'}
        </button>
      </form>
      {status === 'success' && <p className="mt-2 text-green-400">{message}</p>}
      {status === 'error' && <p className="mt-2 text-red-400">{message}</p>}
    </section>
  );
}
