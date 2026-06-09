// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';

/**
 * Hook to manage dark / light theme preference.
 * Persists the choice in localStorage and optionally syncs with the server.
 */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      applyTheme(stored);
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    // Persist to server (optional)
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  };

  return { theme, toggle };
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
}
