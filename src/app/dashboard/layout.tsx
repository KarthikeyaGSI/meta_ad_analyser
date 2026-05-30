'use client';

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useStore } from '../../store/useStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeAccount, setActiveAccount, availableAccounts, sidebarCollapsed: collapsed, brandColor } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Secure Session Check: Redirect to login if user session is absent
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Synchronize route/URL with active account store context for clean separate routes
  useEffect(() => {
    if (!mounted || !user) return;

    const params = new URLSearchParams(window.location.search);
    const accountIdParam = params.get('accountId');
    
    if (accountIdParam) {
      if (activeAccount?.id !== accountIdParam && availableAccounts.length > 0) {
        const found = availableAccounts.find(a => a.id === accountIdParam);
        if (found) {
          setActiveAccount(found);
        }
      }
    } else if (activeAccount) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('accountId', activeAccount.id);
      window.history.replaceState(null, '', `${pathname}?${currentParams.toString()}`);
    }
  }, [mounted, user, pathname, activeAccount, availableAccounts, setActiveAccount]);

  // Dynamic branding variables mapping
  const themeColors = {
    orange: { primary: '#F97316', hover: '#4F46E5' },
    violet: { primary: '#8B5CF6', hover: '#7C3AED' },
    emerald: { primary: '#10B981', hover: '#059669' },
    ocean: { primary: '#0EA5E9', hover: '#0284C7' },
    obsidian: { primary: '#64748B', hover: '#475569' }
  };

  const customStyles = {
    '--color-primary': (themeColors[brandColor as keyof typeof themeColors] || themeColors['orange']).primary,
    '--color-primary-hover': (themeColors[brandColor as keyof typeof themeColors] || themeColors['orange']).hover,
  } as React.CSSProperties;

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Sleek dashboard boot spinner */}
        <div className="w-8 h-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden" 
      style={customStyles}
    >
      {/* Cinematic ambient spatial glows */}
      <div className="glow-bg top-[-100px] right-[-100px] opacity-15"></div>
      <div className="glow-bg-success bottom-[-200px] left-[150px] opacity-10"></div>

      {/* Floating Apple-system Navigation Rail */}
      <Sidebar />

      {/* Floating Header Command Bar */}
      <Navbar />

      {/* Page Content Panel */}
      <motion.main
        initial={false}
        animate={{ paddingLeft: collapsed ? '112px' : '292px' }}
        transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="min-h-screen pt-24 transition-all duration-300"
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 max-w-7xl mx-auto space-y-8"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
