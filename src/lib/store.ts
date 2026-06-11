// src/lib/store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type UIState = {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
};

export const useUIStore = create<UIState>()(
  devtools(set => ({
    theme: 'light',
    language: 'en',
    setTheme: theme => set({ theme }),
    setLanguage: language => set({ language }),
  }))
);
