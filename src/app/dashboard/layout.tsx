'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '../../client/components/Navbar';
import Sidebar from '../../client/components/Sidebar';
import { useStore } from '../../client/store/useStore';
import { CommandPalette } from '../../client/components/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { user, sidebarCollapsed: collapsed } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/login');
    } else if (!user.onboardingCompleted && !pathname.startsWith('/dashboard/onboarding')) {
      router.push('/dashboard/onboarding');
    } else if (user.onboardingCompleted && pathname.startsWith('/dashboard/onboarding')) {
      router.push('/dashboard');
    }
  }, [user, router, pathname]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#4f6ef7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d]">
      <CommandPalette />
      <Sidebar />
      <Navbar />

      <motion.main
        initial={false}
        animate={{ paddingLeft: collapsed ? 60 : 240 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen pt-14"
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
