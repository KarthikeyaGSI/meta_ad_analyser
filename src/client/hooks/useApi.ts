import { useState, useCallback } from 'react';

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (fetchFn: () => Promise<{ data?: T } | T>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      const resolvedData = (response && typeof response === 'object' && 'data' in response ? response.data : response) as T;
      setData(resolvedData);
      return resolvedData;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }, status?: number }, message?: string };
      const apiError: ApiError = {
        message: e?.response?.data?.message || e?.message || 'An unknown error occurred',
        status: e?.response?.status,
        data: e?.response?.data,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, request };
}
