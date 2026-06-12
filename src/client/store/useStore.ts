import { create } from 'zustand';

export interface DateRange {
  label: string;
  startDate: string;
  endDate: string;
}

export interface UserSession {
  token: string;
  id: string;
  name: string;
  email?: string;
  organizationId?: string;
  onboardingCompleted?: boolean;
}

export interface AdAccount {
  id: string;
  name: string;
  actId: string;
}

interface VeroState {
  // Auth state
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  logout: () => void;

  // Active Context
  activeAccount: AdAccount | null;
  setActiveAccount: (account: AdAccount | null) => void;

  availableAccounts: AdAccount[];
  setAvailableAccounts: (accounts: AdAccount[]) => void;

  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;

  // Live Mode & Pacing States
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  syncStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  setSyncStatus: (val: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED') => void;
  lastSyncAt: string | null;
  setLastSyncAt: (val: string | null) => void;

  // Sidebar Layout state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;

  // Agency CNAME Branding
  brandColor: 'orange' | 'violet' | 'emerald' | 'ocean' | 'obsidian';
  setBrandColor: (color: 'orange' | 'violet' | 'emerald' | 'ocean' | 'obsidian') => void;
  agencyName: string;
  setAgencyName: (name: string) => void;

  // Premium Features
  isPremium: boolean;
  setPremium: (val: boolean) => void;

  // Workflow Features
  isAuditMode: boolean;
  setAuditMode: (val: boolean) => void;

  // Refresh Trigger
  refreshTrigger: number;
  triggerRefresh: () => void;
}

// Safe parser to guard against corrupt or empty browser storage configurations
const getSafeLocalItem = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const value = localStorage.getItem(key);
    if (!value || value === 'undefined' || value === 'null') return null;
    return JSON.parse(value);
  } catch (error) {
    console.error('[Vero Store] Failed to parse local item:', key, error);
    return null;
  }
};

// Helpers for default 30 days
const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  
  return {
    label: 'Last 30 Days',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const initialActiveAccount = getSafeLocalItem('ae_active_account');
const initialIsDemo = initialActiveAccount 
  ? (initialActiveAccount.id === 'demo-act-id' || initialActiveAccount.id === 'demo-cosmetics-id')
  : true;

export const useStore = create<VeroState>((set) => ({
  // Auth Store
  user: getSafeLocalItem('ae_session'),
  
  setUser: (user) => set(() => {
    if (user) {
      localStorage.setItem('ae_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('ae_session');
    }
    return { user };
  }),

  logout: () => set(() => {
    localStorage.removeItem('ae_session');
    localStorage.removeItem('ae_active_account');
    return { user: null, activeAccount: null, availableAccounts: [], isDemoMode: true, syncStatus: 'IDLE', lastSyncAt: null };
  }),

  // Account Store
  activeAccount: initialActiveAccount,
  
  setActiveAccount: (account) => set(() => {
    if (account) {
      localStorage.setItem('ae_active_account', JSON.stringify(account));
      const isDemo = account.id === 'demo-act-id' || account.id === 'demo-cosmetics-id';
      return { activeAccount: account, isDemoMode: isDemo };
    } else {
      localStorage.removeItem('ae_active_account');
      return { activeAccount: null, isDemoMode: true };
    }
  }),

  availableAccounts: [],
  setAvailableAccounts: (accounts) => set({ availableAccounts: accounts }),

  // Date Range Store
  dateRange: getDefaultDateRange(),
  setDateRange: (range) => set({ dateRange: range }),

  // Live Mode Tracking
  isDemoMode: initialIsDemo,
  setIsDemoMode: (val) => set({ isDemoMode: val }),
  syncStatus: 'IDLE',
  setSyncStatus: (val) => set({ syncStatus: val }),
  lastSyncAt: null,
  setLastSyncAt: (val) => set({ lastSyncAt: val }),

  // Sidebar Layout
  sidebarCollapsed: false,
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),

  // Agency CNAME Branding
  brandColor: getSafeLocalItem('ae_brand_color') || 'orange',
  setBrandColor: (color) => set(() => {
    localStorage.setItem('ae_brand_color', JSON.stringify(color));
    return { brandColor: color };
  }),
  agencyName: getSafeLocalItem('ae_agency_name') || 'Vero Analytics',
  setAgencyName: (name) => set(() => {
    localStorage.setItem('ae_agency_name', JSON.stringify(name));
    return { agencyName: name };
  }),

  // Premium Features
  isPremium: getSafeLocalItem('ae_is_premium') || false,
  setPremium: (val: boolean) => {
    localStorage.setItem('ae_is_premium', JSON.stringify(val));
    set({ isPremium: val });
  },

  // Workflow Features
  isAuditMode: getSafeLocalItem('ae_is_audit_mode') ?? true,
  setAuditMode: (val: boolean) => {
    localStorage.setItem('ae_is_audit_mode', JSON.stringify(val));
    set({ isAuditMode: val });
  },

  // Global Refresh Signal
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
