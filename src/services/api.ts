import axios from 'axios';
import { demoAccounts, demoOverview, demoCharts, demoCampaigns, demoAdsets, demoCreatives, demoBreakdowns, demoAiRecommendations } from '../data/demoData';
import { enableSandbox } from '../lib/runtime';
import { useStore } from '../store/useStore';
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
} from '../utils/mappers';

export const authApi = {
  register: (data: Record<string, unknown>) => safeFetch(() => apiClient.post('/auth/register', data), { success: true, token: 'demo_token' }),
  login: (data: Record<string, unknown>) => safeFetch(() => apiClient.post('/auth/login', data), { success: true, token: 'demo_token' }),
  guestLogin: () => safeFetch(() => apiClient.post('/auth/guest'), { id: 'demo_user', name: 'Demo User', token: 'demo_token' }),
  getMetaLoginUrl: () => safeFetch(() => apiClient.get('/auth/meta/login'), { url: '/dashboard' }),
  submitMetaCallback: (code: string, userId: string) => safeFetch(() => apiClient.post('/auth/meta/callback', { code, userId }), { 
    success: true,
    token: 'demo_mock_token_123',
    user: { id: userId, name: 'Demo User', email: 'demo@aetheris.co' },
    accounts: demoAccounts,
    adAccountConnected: true,
    insightsWorking: true,
    campaignCount: demoCampaigns.list?.length || 0,
    hasSpendData: true
  }),
};

import { MetaDirectApi } from './metaDirect';

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
    let rawOverview;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawOverview = await MetaDirectApi.getOverview(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawOverview) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/overview`, { params: { startDate, endDate } }), demoOverview);
      rawOverview = res.data;
    }
    return { data: mapAnalyticsOverview(rawOverview) };
  },
  getCharts: async (accountId: string, startDate: string, endDate: string) => {
    let rawCharts;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawCharts = await MetaDirectApi.getCharts(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawCharts) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/charts`, { params: { startDate, endDate } }), demoCharts);
      rawCharts = res.data;
    }
    return { data: (rawCharts ?? []).map(mapInsightDocument) };
  },
  getCampaigns: async (accountId: string, startDate: string, endDate: string, filters: Record<string, unknown> = {}) => {
    let rawCampaigns;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawCampaigns = await MetaDirectApi.getCampaigns(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawCampaigns) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/campaigns`, { params: { startDate, endDate, ...filters } }), demoCampaigns);
      rawCampaigns = res.data;
    }
    const list = (rawCampaigns?.list ?? rawCampaigns ?? []).map(mapCampaignDocument);
    return { data: { list, total: list.length } };
  },
  getAdsets: async (accountId: string, startDate: string, endDate: string) => {
    let rawAdsets;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawAdsets = await MetaDirectApi.getAdsets(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawAdsets) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/adsets`, { params: { startDate, endDate } }), demoAdsets);
      rawAdsets = res.data;
    }
    return { data: rawAdsets ?? [] };
  },
  getCreatives: async (accountId: string, startDate: string, endDate: string) => {
    let rawCreatives;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawCreatives = await MetaDirectApi.getCreatives(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawCreatives) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/creatives`, { params: { startDate, endDate } }), demoCreatives);
      rawCreatives = res.data;
    }
    return { data: (rawCreatives ?? []).map(mapCreativeDocument) };
  },
  getBreakdowns: async (accountId: string, startDate: string, endDate: string) => {
    let rawBreakdowns;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawBreakdowns = await MetaDirectApi.getBreakdowns(accountId, startDate, endDate);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawBreakdowns) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/breakdowns`, { params: { startDate, endDate } }), demoBreakdowns);
      rawBreakdowns = res.data;
    }
    return { data: rawBreakdowns ?? { demographics: [], devices: [], placements: [] } };
  },
  getRecommendations: async (accountId: string) => {
    let rawRecs;
    if (MetaDirectApi.getToken(accountId)) {
      try {
        rawRecs = await MetaDirectApi.getRecommendations(accountId);
      } catch (error) {
        console.warn('Live token failed, falling back to demo data', error);
      }
    }
    if (!rawRecs) {
      const res = await safeFetch(() => apiClient.get(`/accounts/${accountId}/recommendations`), demoAiRecommendations);
      rawRecs = res.data;
    }
    return { data: (rawRecs ?? []).map(mapAIRecommendation) };
  },
  triggerSync: (accountId: string) => 
    safeFetch(() => apiClient.post(`/accounts/${accountId}/sync`), { success: true }),
  connectDirectToken: (data: { adAccountId: string; accessToken: string; customAccountName?: string }) => 
    safeFetch(() => apiClient.post('/accounts/connect', data), { 
      account: { id: data.adAccountId, name: data.customAccountName || 'Direct Meta Account', actId: data.adAccountId },
      insightsWorking: true,
      accountId: data.adAccountId
    }),
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

