'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Trash2, Users, ShieldAlert, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface Activation {
  id: string;
  userId: string;
  licenseId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export default function TeamSettingsPage() {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchActivations();
  }, []);

  const fetchActivations = async () => {
    try {
      const res = await fetch('/api/admin/seats');
      const data = await res.json();
      if (data.success) {
        setActivations(data.activations);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load team seats');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this seat? The user will be immediately logged out.')) return;
    
    setRevoking(id);
    try {
      const res = await fetch('/api/admin/seats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationId: id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Seat revoked successfully');
        setActivations(activations.map(a => a.id === id ? { ...a, status: 'revoked' } : a));
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke seat');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeSeats = activations.filter(a => a.status === 'active').length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Seats</h1>
        <p className="text-gray-500 mt-2">Manage your organization's active devices and licenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black border border-white/10 p-6 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Seats</p>
            <h2 className="text-2xl font-bold">{activeSeats}</h2>
          </div>
        </div>
      </div>

      <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">User ID</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {activations.map((activation) => (
              <tr key={activation.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center space-x-3">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  <span className="truncate max-w-[200px]">{activation.userId}</span>
                </td>
                <td className="px-6 py-4">
                  {activation.status === 'active' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                      Revoked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(activation.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {activation.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(activation.id)}
                      disabled={revoking === activation.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center justify-end w-full space-x-2"
                    >
                      {revoking === activation.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>Revoke</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {activations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No active seats found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
