'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserX, UserCheck, AlertCircle } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { apiClient } from '../../../services/api';

export default function AdminDashboard() {
  const { user } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users. You may not be an admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (targetUserId: string) => {
    if (!window.confirm('Are you sure you want to revoke this user\\'s premium access?')) return;
    try {
      await apiClient.post('/admin/revoke', { targetUserId });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to revoke access.');
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10" />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-24 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-muted text-sm">Manage user access and subscriptions</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-muted">
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Premium Until</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={u.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm text-white">{u.email}</td>
                  <td className="p-4 text-sm text-slate-300">{u.name}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {u.role || 'User'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {u.premiumUntil ? new Date(u.premiumUntil).toLocaleDateString() : <span className="text-muted">Free Tier</span>}
                  </td>
                  <td className="p-4 text-right">
                    {u.premiumUntil && u.role !== 'admin' && (
                      <button 
                        onClick={() => handleRevoke(u.id)}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <UserX className="w-3 h-3" /> Revoke Premium
                      </button>
                    )}
                    {!u.premiumUntil && u.role !== 'admin' && (
                      <span className="text-xs text-muted flex items-center justify-end gap-1">
                        <UserCheck className="w-3 h-3" /> No Action
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
