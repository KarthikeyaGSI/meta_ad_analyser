// src/lib/runtime.ts
// Pure runtime environment detection.

export const hasAppwrite = Boolean(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
);

export const hasMeta = Boolean(
  process.env.META_ACCESS_TOKEN
);

// We define demo/sandbox mode strictly as lacking the core Appwrite database credentials,
// or if sandbox mode is explicitly enabled via environment variables.
export const enableSandbox =
  process.env.NEXT_PUBLIC_ENABLE_SANDBOX === 'true' ||
  process.env.ENABLE_SANDBOX === 'true' ||
  !hasAppwrite;
