'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Layers, 
  FolderLock, 
  Image, 
  BrainCircuit, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Gauge, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useStore();

  const menuItems = [
    { name: 'Overview', icon: Gauge, path: '/dashboard' },
    { name: 'Campaigns', icon: Layers, path: '/dashboard/campaigns' },
    { name: 'Ad Sets', icon: FolderLock, path: '/dashboard/adsets' },
    { name: 'Creatives', icon: Image, path: '/dashboard/creatives' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { name: 'AI Recommendations', icon: BrainCircuit, path: '/dashboard/ai-insights', badge: 'New' },
    { name: 'AI Chat Analyst', icon: MessageSquare, path: '/dashboard/chat', badge: 'Beta' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="fixed left-4 top-4 bottom-4 z-30 rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-3xl flex flex-col justify-between shadow-[0_16px_48px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.04)]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-glow-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-sm tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AETHERIS
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition btn-touch"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-1 scrollbar-none">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full group relative flex items-center gap-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 btn-touch ${
                  isActive 
                    ? 'bg-white/[0.05] border border-white/[0.08] text-white shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.06)]' 
                    : 'bg-transparent border border-transparent text-muted hover:text-white hover:bg-white/[0.02]'
                } ${collapsed ? 'justify-center px-0' : 'px-3.5'}`}
              >
                {/* Active Indicator Pill */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-1.5 w-1 h-5 rounded-full bg-gradient-to-b from-primary to-indigo-400"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <Icon className={`w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-primary' : 'text-muted group-hover:text-white'}`} />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                
                {/* Badge Overlay */}
                {!collapsed && item.badge && (
                  <span className="absolute right-3 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-success to-emerald-400 text-background">
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-16 scale-0 rounded-xl bg-surface/90 border border-white/[0.08] backdrop-blur-md px-3 py-1.5 text-xs text-white opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-left duration-250 pointer-events-none shadow-glass-shadow">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER USER PROFILE */}
      <div className="p-3 border-t border-white/[0.04] bg-white/[0.005] shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8.5 h-8.5 rounded-full bg-indigo-900/40 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
            {user?.name ? user.name[0].toUpperCase() : 'G'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[9px] text-muted truncate">{user?.email || 'demo@aetheris.co'}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-danger transition btn-touch"
              title="Logout Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
