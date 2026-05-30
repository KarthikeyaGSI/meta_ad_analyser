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
  MessageSquare,
  Users,
  Network,
  Crown
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import UpgradeModal from './UpgradeModal';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed, isPremium, agencyName } = useStore();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('');

  const handleSupportClick = () => {
    if (!isPremium) {
      setUpgradeFeatureName('Priority Support');
      setUpgradeModalOpen(true);
    } else {
      window.location.href = 'mailto:business.marketingko@gmail.com?subject=Priority Support Request';
    }
  };

  type MenuItem = { name: string; icon: any; path: string; premium?: boolean; badge?: string };

  const menuItems: MenuItem[] = [
    { name: 'Overview', icon: Gauge, path: '/dashboard' },
    { name: 'Campaigns', icon: Layers, path: '/dashboard/campaigns' },
    { name: 'Ad Sets', icon: FolderLock, path: '/dashboard/adsets' },
    { name: 'Creatives', icon: Image, path: '/dashboard/creatives' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { name: 'Leads Intelligence', icon: Users, path: '/dashboard/leads', premium: true },
    { name: 'Audience Insights', icon: Users, path: '/dashboard/audience', premium: true },
    { name: 'AI Recommendations', icon: BrainCircuit, path: '/dashboard/ai-insights', premium: true },
    { name: 'AI Chat Analyst', icon: MessageSquare, path: '/dashboard/chat', premium: true },
    { name: 'Automation & Rules', icon: Network, path: '/dashboard/workflows', premium: true },
    { name: 'Competitor Tracking', icon: Layers, path: '/dashboard/competitors', premium: true },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigation = (path: string, isPremiumFeature?: boolean, featureName?: string) => {
    if (isPremiumFeature && !isPremium) {
      setUpgradeFeatureName(featureName || 'Premium Feature');
      setUpgradeModalOpen(true);
      return;
    }
    router.push(path);
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-glow-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-sm tracking-wide truncate">
                {agencyName}
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
            const isLocked = item.premium && !isPremium;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.premium, item.name)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted hover:text-white hover:bg-white/[0.03]'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
                
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 overflow-hidden">
                    <span className="text-[11px] truncate">{item.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLocked && (
                        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                          <FolderLock className="w-2.5 h-2.5 text-primary" />
                        </span>
                      )}
                      {item.badge && (
                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-md
                          ${item.badge === 'Beta' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : ''}
                          ${item.badge === 'New' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : ''}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* PRIORITY SUPPORT */}
        {!collapsed && (
          <div className="px-4 mt-4">
            <button 
              onClick={handleSupportClick}
              className={`w-full py-2.5 rounded-xl text-[10px] font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                isPremium 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-white/5 text-muted border border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              PRIORITY SUPPORT
              {!isPremium && <FolderLock className="w-3 h-3 ml-1 text-primary" />}
            </button>
          </div>
        )}

        {/* CTA UPGRADE BUTTON */}
        {!collapsed && !isPremium && (
          <div className="px-4 mb-4 mt-2">
            <button 
              onClick={() => { setUpgradeFeatureName('All Premium Features'); setUpgradeModalOpen(true); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-[10px] font-bold shadow-glow-primary transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-3.5 h-3.5" />
              UPGRADE FEATURES
            </button>
          </div>
        )}
      </div>

      {/* FOOTER USER PROFILE */}
      <div className="p-3 border-t border-white/[0.04] bg-white/[0.005] shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8.5 h-8.5 rounded-full bg-orange-900/40 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
            {user?.name ? user.name[0].toUpperCase() : 'G'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[9px] text-muted truncate">{user?.email || 'demo@vero.co'}</p>
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
      
      {/* UPGRADE MODAL INTEGRATION */}
      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName={upgradeFeatureName} 
      />
    </motion.aside>
  );
}
