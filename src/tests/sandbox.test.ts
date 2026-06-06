import { enableSandbox } from '../shared/lib/runtime';
import { safeFetch } from '../services/api';

// Mock the apiClient to ensure it is not called when sandbox is enabled
jest.mock('../services/api', () => {
  const originalModule = jest.requireActual('../services/api');
  return {
    ...originalModule,
    apiClient: {
      get: jest.fn(() => Promise.resolve({ data: { from: 'live' } })),
      post: jest.fn(() => Promise.resolve({ data: { from: 'live' } })),
    },
  };
});

describe('Sandbox mode fallback', () => {
  it('returns demo data when enableSandbox is true', async () => {
    // Force enableSandbox to true for this test
    (process.env as any).NEXT_PUBLIC_ENABLE_SANDBOX = 'true';
    // reload the flag (runtime reads env at import time, so we need to re-import)
    jest.resetModules();
    const { enableSandbox: flag } = require('../lib/runtime');
    const { safeFetch } = require('../services/api');
    const result = await safeFetch(() => Promise.resolve({ data: { live: true } }), { demo: true });
    expect(flag).toBe(true);
    expect(result.data).toEqual({ demo: true });
  });

  it('calls real API when sandbox is disabled', async () => {
    (process.env as any).NEXT_PUBLIC_ENABLE_SANDBOX = 'false';
    jest.resetModules();
    const { enableSandbox: flag } = require('../lib/runtime');
    const { apiClient } = require('../services/api');
    const { safeFetch } = require('../services/api');
    const apiResult = { data: { live: true } };
    apiClient.get.mockResolvedValueOnce(apiResult);
    const result = await safeFetch(() => apiClient.get('/test'), { demo: true });
    expect(flag).toBe(false);
    expect(result).toBe(apiResult);
  });
});
