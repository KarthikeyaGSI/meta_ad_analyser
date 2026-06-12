import axios from 'axios';
import { demoAccounts, demoOverview, demoCharts, demoCampaigns, demoAdsets, demoCreatives, demoBreakdowns, demoAiRecommendations } from '../shared/data/demoData';
import { enableSandbox } from '../shared/lib/runtime';
import { useStore } from '../client/store/useStore';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT session token into all requests
apiClient.interceptors.request.use(
  (config) => {
    const session = useStore.getState().user;
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Redirect to login if token is expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip redirect in sandbox mode, let safeFetch handle the mock fallback
    if (enableSandbox) return Promise.reject(error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      useStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// API REQUEST METHODS
// ----------------------------------------------------

export async function safeFetch<T>(
  apiCall: () => Promise<{ data: T }>,
  demoFallback: T
): Promise<{ data: T }> {
  if (enableSandbox) {
    return { data: demoFallback };
  }
  try {
    const res = await apiCall();
    return res;
  } catch (error) {
    console.warn('[API Fallback] Request failed, returning demo data.', error);
    return { data: demoFallback };
  }
}

import {
  mapCampaignDocument,
  mapCreativeDocument,
  mapInsightDocument,
  mapAnalyticsOverview,
  mapAIRecommendation
} from '../shared/utils/mappers';

export const authApi = {
  register: (data: Record<string, unknown>) => safeFetch(() => apiClient.post('/auth/register', data), { success: true, token: 'demo_token' }),
  login: (data: Record<string, unknown>) => safeFetch(() => apiClient.post('/auth/login', data), { success: true, token: 'demo_token' }),
  guestLogin: () => safeFetch(() => apiClient.post('/auth/guest'), { id: 'demo_user', name: 'Demo User', token: 'demo_token' }),
  getMetaLoginUrl: () => safeFetch(() => apiClient.get('/auth/meta/login'), { url: '/dashboard' }),
  submitMetaCallback: (code: string, userId: string) => safeFetch(() => apiClient.post('/auth/meta/callback', { code, userId }), { 
    success: true,
    token: 'demo_mock_token_123',
    user: { id: userId, name: 'Demo User', email: 'demo@vero.co' },
    accounts: demoAccounts,
    adAccountConnected: true,
    insightsWorking: true,
    campaignCount: demoCampaigns.list?.length || 0,
    hasSpendData: true
  }),
};


export const analyticsApi = {
  getAccounts: async () => {
    const res = await safeFetch(() => apiClient.get('/accounts'), demoAccounts);
    if (typeof window !== 'undefined') {
      const allKeys = Object.keys(localStorage);
      const customAccountIds = allKeys
        .filter(k => k.startsWith('meta_token_'))
        .map(k => k.replace('meta_token_', ''));
      
      const activeStr = localStorage.getItem('ae_active_account');
      if (activeStr) {
        try {
          const activeAct = JSON.parse(activeStr);
          if (customAccountIds.includes(activeAct.id) && !res.data.find((a: { id: string }) => a.id === activeAct.id)) {
            // Prepend the active custom account so it shows in lists
            res.data = [activeAct, ...res.data];
          }
        } catch {
          // Ignore parse error
        }
      }
    }
    return res;
  },
  getOverview: async (accountId: string, startDate: string, endDate: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'overview', accountId, startDate, endDate } });
    return { data: mapAnalyticsOverview(res.data.data) };
  },
  getCharts: async (accountId: string, startDate: string, endDate: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'charts', accountId, startDate, endDate } });
    return { data: (res.data.data ?? []).map(mapInsightDocument) };
  },
  getCampaigns: async (accountId: string, startDate: string, endDate: string, filters: Record<string, unknown> = {}) => {
    const res = await apiClient.get('/meta', { params: { action: 'campaigns', accountId, startDate, endDate, ...filters } });
    const list = (res.data.data?.list ?? res.data.data ?? []).map(mapCampaignDocument);
    return { data: { list, total: list.length } };
  },
  getAdsets: async (accountId: string, startDate: string, endDate: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'adsets', accountId, startDate, endDate } });
    return { data: res.data.data ?? [] };
  },
  getCreatives: async (accountId: string, startDate: string, endDate: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'creatives', accountId, startDate, endDate } });
    const rawCreatives = res.data.data;
    const list = Array.isArray(rawCreatives) ? rawCreatives : (rawCreatives?.list || []);
    return { data: list.map(mapCreativeDocument) };
  },
  getBreakdowns: async (accountId: string, startDate: string, endDate: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'breakdowns', accountId, startDate, endDate } });
    return { data: res.data.data ?? { demographics: [], devices: [], placements: [] } };
  },
  getRecommendations: async (accountId: string) => {
    const res = await apiClient.get('/meta', { params: { action: 'recommendations', accountId } });
    return { data: (res.data.data ?? []).map(mapAIRecommendation) };
  },
  triggerSync: (accountId: string) => 
    safeFetch(() => apiClient.post(`/accounts/${accountId}/sync`), { success: true }),
  triggerMockWebhook: (accountId: string) =>
    safeFetch(() => apiClient.post(`/webhooks/mock`, { accountId }), { success: true }),
  connectDirectToken: async (data: { adAccountId: string; metaKey: string; customAccountName?: string }) => {
    const res = await apiClient.post('/meta/connect', data);
    return res;
  },
  getMetrics: async (accountId: string, startDate: string, endDate: string) => {
    return apiClient.get(`/analytics/${accountId}/metrics`, { params: { startDate, endDate } });
  },
  exportCsvUrl: (accountId: string, startDate: string, endDate: string) => 
    `${API_BASE_URL}/accounts/${accountId}/export?startDate=${startDate}&endDate=${endDate}`,
  executeAutopilotRule: async (accountId: string, recommendationId: string) => 
    safeFetch(() => apiClient.post(`/accounts/${accountId}/rules/execute`, { recommendationId }), {
      success: true,
      recommendationId,
      campaignName: 'Meta Active Campaign',
      actionTaken: 'Campaign budget scaled by +15%.',
      autopilotDetails: 'Meta marketing node adjusted active campaign delivery ceiling to scale performance.',
      executedAt: new Date().toISOString()
    }),
};

