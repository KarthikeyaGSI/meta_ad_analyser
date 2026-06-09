// src/lib/runtime.ts
/**
 * Runtime configuration utilities.
 * Reads environment variables at import time.
 */
export const enableSandbox: boolean = (process.env.NEXT_PUBLIC_ENABLE_SANDBOX ?? 'false') === 'true';
