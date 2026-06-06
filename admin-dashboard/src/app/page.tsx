import React from 'react';
import { db } from '@/server/db';
import { auditLogs, licenses } from '@/server/db/schema';
import { desc, count } from 'drizzle-orm';
import { Activity, Users, Shield, ShieldOff, Key } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // @ts-ignore
  const [{ count: totalLicenses }] = await db.select({ count: count() }).from(licenses);
  
  const recentLogs = await db.select()
    .from(auditLogs)
    // @ts-ignore
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Console</h1>
            <p className="text-neutral-400 mt-1">Platform metrics and license activities</p>
          </div>
        </header>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl">
            <div className="flex items-center text-neutral-400 mb-4"><Users className="w-4 h-4 mr-2" /> Total Licenses</div>
            <div className="text-3xl font-semibold">{String(totalLicenses)}</div>
          </div>
          {/* Add more metrics mapping here later */}
        </div>

        {/* Recent Activity Table */}
        <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Audit Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-400 uppercase bg-black/20">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity ID</th>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">{log.action}</td>
                    <td className="px-6 py-4 text-neutral-400">{log.entityId}</td>
                    <td className="px-6 py-4 text-neutral-400">{log.userId}</td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-neutral-500">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
