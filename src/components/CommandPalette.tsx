'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, Star, Settings, Users, CreditCard, LayoutDashboard } from 'lucide-react';
import { useStore } from '../store/useStore';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { isPremium } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Home', href: '/dashboard/welcome' },
    { icon: Settings, label: 'Settings & Integrations', href: '/dashboard/settings' },
    { icon: Users, label: 'Referrals', href: '/dashboard/referrals' },
    { icon: Star, label: 'Customer Success', href: '/dashboard/success' },
    { icon: CreditCard, label: 'Premium Billing', href: '/dashboard/premium' },
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      <dialog 
        open
        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        aria-label="Command Palette"
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40 mr-3" aria-hidden="true" />
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-white/30"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search commands"
          />
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-flex px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-medium text-white/40">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-white/40 text-sm">
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
                Quick Actions
              </div>
              {filteredItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 text-white/70 transition-colors cursor-pointer text-left"
                  role="option"
                  aria-selected="false"
                >
                  <div className="p-2 bg-white/5 rounded-lg" aria-hidden="true">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  <Command className="w-3.5 h-3.5 text-white/20" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-white/5 bg-[#050505] flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd> to select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Agent Search Active
          </div>
        </div>
      </dialog>
    </div>
  );
}
