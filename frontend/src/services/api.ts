import axios from 'axios';
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
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  guestLogin: () => apiClient.post('/auth/guest'),
  getMetaLoginUrl: () => apiClient.get('/auth/meta/login'),
  submitMetaCallback: (code: string, userId: string) => apiClient.post('/auth/meta/callback', { code, userId }),
};

export const analyticsApi = {
  getAccounts: () => apiClient.get('/accounts'),
  getOverview: (accountId: string, startDate: string, endDate: string) => 
    apiClient.get(`/accounts/${accountId}/overview`, { params: { startDate, endDate } }),
  getCharts: (accountId: string, startDate: string, endDate: string) => 
    apiClient.get(`/accounts/${accountId}/charts`, { params: { startDate, endDate } }),
  getCampaigns: (accountId: string, startDate: string, endDate: string, filters: any = {}) => 
    apiClient.get(`/accounts/${accountId}/campaigns`, { params: { startDate, endDate, ...filters } }),
  getAdsets: (accountId: string, startDate: string, endDate: string) => 
    apiClient.get(`/accounts/${accountId}/adsets`, { params: { startDate, endDate } }),
  getCreatives: (accountId: string, startDate: string, endDate: string) => 
    apiClient.get(`/accounts/${accountId}/creatives`, { params: { startDate, endDate } }),
  getBreakdowns: (accountId: string, startDate: string, endDate: string) => 
    apiClient.get(`/accounts/${accountId}/breakdowns`, { params: { startDate, endDate } }),
  getRecommendations: (accountId: string) => 
    apiClient.get(`/accounts/${accountId}/recommendations`),
  triggerSync: (accountId: string) => 
    apiClient.post(`/accounts/${accountId}/sync`),
  connectDirectToken: (data: { adAccountId: string; accessToken: string; customAccountName?: string }) => 
    apiClient.post('/accounts/connect', data),
  exportCsvUrl: (accountId: string, startDate: string, endDate: string) => 
    `${API_BASE_URL}/accounts/${accountId}/export?startDate=${startDate}&endDate=${endDate}`,
};
