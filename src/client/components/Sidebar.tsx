'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Layers, Image, Settings, ChevronLeft, ChevronRight,
  LogOut, Gauge, MessageSquare, Network, Users, BrainCircuit, Lock,
  ArrowRight, ShieldAlert
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../store/useStore';

type MenuItem = {
  name: string;
  icon: React.ElementType;
  path: string;
  premium?: boolean;
};

const NAV_ITEMS: MenuItem[] = [
  { name: 'Overview',           icon: Gauge,         path: '/dashboard' },
  { name: 'Campaigns',          icon: Layers,        path: '/dashboard/campaigns' },
  { name: 'Ad Sets',            icon: BarChart3,     path: '/dashboard/adsets' },
  { name: 'Creatives',          icon: Image,         path: '/dashboard/creatives' },
  { name: 'Analytics',          icon: BarChart3,     path: '/dashboard/analytics' },
  { name: 'AI Recommendations', icon: BrainCircuit,  path: '/dashboard/ai-insights', premium: true },
  { name: 'AI Chat',            icon: MessageSquare, path: '/dashboard/chat',         premium: true },
  { name: 'Automations',        icon: Network,       path: '/dashboard/workflows',    premium: true },
  { name: 'Competitors',        icon: ShieldAlert,   path: '/dashboard/competitors',  premium: true },
  { name: 'Leads',              icon: Users,         path: '/dashboard/leads',        premium: true },
  { name: 'Audience',           icon: Users,         path: '/dashboard/audience',     premium: true },
];

const NAV_BOTTOM: MenuItem[] = [
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout, sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed, isPremium, agencyName } = useStore();

  const handleLogout = () => { logout(); router.push('/login'); };

  const renderNavItem = (item: MenuItem) => {
    const isActive  = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
    const isLocked  = item.premium && !isPremium;
    const Icon      = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => router.push(item.path)}
        title={collapsed ? item.name : undefined}
        className={[
          'nav-item w-full relative',
          isActive ? 'nav-item-active' : '',
          collapsed ? 'justify-center px-2' : '',
        ].join(' ')}
      >
        {isActive && (
          <motion.div
            layoutId="nav-active"
            className="absolute inset-0 rounded-[10px] bg-[#4f6ef7]/8 border border-[#4f6ef7]/15"
            transition={{ duration: 0.2 }}
          />
        )}
        <Icon className={`w-4 h-4 shrink-0 relative z-10 ${isActive ? 'text-[#818cf8]' : ''}`} />
        {!collapsed && (
          <span className="flex-1 text-left truncate relative z-10">{item.name}</span>
        )}
        {!collapsed && isLocked && (
          <Lock className="w-3 h-3 text-[#535a65] shrink-0 relative z-10" />
        )}
      </button>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r border-white/[0.07] bg-[#0a0b0d]"
    >
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'justify-center px-4' : 'px-4 justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-[#4f6ef7] flex items-center justify-center shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#f1f3f5] truncate">{agencyName || 'Vero'}</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-[#4f6ef7] flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-white/[0.05] text-[#535a65] hover:text-[#8b92a0] transition-colors shrink-0"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(renderNavItem)}

        {!collapsed && !isPremium && (
          <div className="mt-3 mx-1">
            <div className="p-3 rounded-xl border border-[#4f6ef7]/20 bg-[#4f6ef7]/5">
              <p className="text-xs font-medium text-[#818cf8] mb-2">Upgrade to Premium</p>
              <p className="text-[11px] text-[#535a65] mb-3 leading-relaxed">
                Unlock AI recommendations, automations, and competitor tracking.
              </p>
              <Link
                href="/dashboard/premium"
                className="flex items-center justify-center gap-1.5 w-full h-7 bg-[#4f6ef7]/20 hover:bg-[#4f6ef7]/30 text-[#818cf8] text-xs font-medium rounded-lg transition-colors"
              >
                Apply for access <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-white/[0.06] px-2 py-2 space-y-0.5">
        {NAV_BOTTOM.map(renderNavItem)}

        {/* User row */}
        <div className={`flex items-center gap-2.5 px-2.5 py-2 mt-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-[#4f6ef7]/20 border border-[#4f6ef7]/30 flex items-center justify-center text-xs font-semibold text-[#818cf8] shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#f1f3f5] truncate">{user?.name ?? 'User'}</p>
                <p className="text-[10px] text-[#535a65] truncate">{user?.email ?? ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-red-500/10 text-[#535a65] hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
