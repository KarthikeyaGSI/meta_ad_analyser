// src/client/components/ui/PremiumCTA.tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Sticky Premium Call‑To‑Action banner.
 * Visible when the user is not on a premium plan (isPremium === false).
 */
export default function PremiumCTA() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="/pricing"
        className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl px-4 py-2 shadow-xl hover:bg-white/20 transition-all animate-fade-in"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="text-sm font-semibold text-white">
          Unlock Premium Features
        </span>
        <ArrowRight className="w-4 h-4 text-primary animate-bounce" />
      </a>
    </div>
  );
}
