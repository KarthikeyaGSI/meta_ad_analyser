// src/client/components/ui/ThemeToggle.tsx
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';
import { motion } from 'framer-motion'; // ensure framer-motion is installed

/**
 * ThemeToggle – a tiny component that toggles between light and dark mode.
 * Enhancements:
 * • Glass‑morphism background with subtle blur.
 * • Micro‑animation using Framer Motion (rotation on toggle).
 * • Persists theme in localStorage and syncs with the `/api/theme` endpoint.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  // Persist theme to localStorage on change and sync with backend cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      // Fire‑and‑forget POST to set cookie on server (no need to await in UI)
      fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }).catch(() => {});
    }
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-md transition-colors hover:bg-white/30"
    >
      <motion.svg
        key={theme}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.4 }}
      >
        {theme === 'dark' ? (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        ) : (
          <path d="M12 3v2M12 19v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M3 12h2M19 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z" />
        )}
      </motion.svg>
    </Button>
  );
}
