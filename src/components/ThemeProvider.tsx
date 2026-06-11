// src/components/ThemeProvider.tsx
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

/**
 * ThemeProvider synchronises the UI theme (light / dark) from Zustand store
 * with the HTML document's `classList`. It applies the `dark` class when the
 * selected theme is "dark" which enables Tailwind's dark‑mode utilities.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore(state => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
