"use client";

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

/**
 * ThemeProvider synchronises the UI theme (light / dark) from Zustand store
 * with the HTML document's `classList`. It applies the `dark` class when the
 * selected theme is "dark" which enables Tailwind's dark‑mode utilities.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  return <>{children}</>;
}
