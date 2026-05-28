import axios from 'axios';
import { useStore } from '../store/useStore';
import { enableSandbox } from '../lib/runtime';
import { demoData } from '../data/demoData';

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

async function safeFetch<T>(
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

export const authApi = {
  register: (data: any) => safeFetch(() => apiClient.post('/auth/register', data), { success: true, token: 'demo_token' }),
  login: (data: any) => safeFetch(() => apiClient.post('/auth/login', data), { success: true, token: 'demo_token' }),
  guestLogin: () => safeFetch(() => apiClient.post('/auth/guest'), { id: 'demo_user', name: 'Demo User', token: 'demo_token' }),
  getMetaLoginUrl: () => safeFetch(() => apiClient.get('/auth/meta/login'), { url: '/dashboard' }),
  submitMetaCallback: (code: string, userId: string) => safeFetch(() => apiClient.post('/auth/meta/callback', { code, userId }), { success: true }),
};

import {
  demoAccounts,
  demoOverview,
  demoCharts,
  demoCampaigns,
  demoAdsets,
  demoCreatives,
  demoBreakdowns,
  demoAiRecommendations
} from '../data/demoData';

export const analyticsApi = {
  getAccounts: () => safeFetch(() => apiClient.get('/accounts'), demoAccounts),
  getOverview: (accountId: string, startDate: string, endDate: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/overview`, { params: { startDate, endDate } }), demoOverview),
  getCharts: (accountId: string, startDate: string, endDate: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/charts`, { params: { startDate, endDate } }), demoCharts),
  getCampaigns: (accountId: string, startDate: string, endDate: string, filters: any = {}) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/campaigns`, { params: { startDate, endDate, ...filters } }), demoCampaigns),
  getAdsets: (accountId: string, startDate: string, endDate: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/adsets`, { params: { startDate, endDate } }), demoAdsets),
  getCreatives: (accountId: string, startDate: string, endDate: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/creatives`, { params: { startDate, endDate } }), demoCreatives),
  getBreakdowns: (accountId: string, startDate: string, endDate: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/breakdowns`, { params: { startDate, endDate } }), demoBreakdowns),
  getRecommendations: (accountId: string) => 
    safeFetch(() => apiClient.get(`/accounts/${accountId}/recommendations`), demoAiRecommendations),
  triggerSync: (accountId: string) => 
    safeFetch(() => apiClient.post(`/accounts/${accountId}/sync`), { success: true }),
  connectDirectToken: (data: { adAccountId: string; accessToken: string; customAccountName?: string }) => 
    safeFetch(() => apiClient.post('/accounts/connect', data), { 
      account: { id: data.adAccountId, name: data.customAccountName || 'Demo Account', actId: data.adAccountId },
      insightsWorking: true,
      accountId: data.adAccountId
    }),
  exportCsvUrl: (accountId: string, startDate: string, endDate: string) => 
    `${API_BASE_URL}/accounts/${accountId}/export?startDate=${startDate}&endDate=${endDate}`,
};
