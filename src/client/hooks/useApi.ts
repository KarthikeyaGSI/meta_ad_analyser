import { useState, useCallback } from 'react';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (fetchFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      setData(response.data ?? response);
      return response.data ?? response;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err?.response?.data?.message || err?.message || 'An unknown error occurred',
        status: err?.response?.status,
        data: err?.response?.data,
      };
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, request };
}
