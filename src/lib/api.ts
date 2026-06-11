// src/lib/api.ts
import axios from 'axios';
import { useUIStore } from './store';

// Create an Axios instance that respects the current theme (e.g., for logging) and language headers.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/',
  timeout: 10000,
});

// Request interceptor to add language header
api.interceptors.request.use(config => {
  const { language } = useUIStore.getState();
  if (language) {
    config.headers['Accept-Language'] = language;
  }
  return config;
});

export default api;
