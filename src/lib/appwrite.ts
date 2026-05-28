// src/lib/appwrite.ts – Appwrite client with runtime guard
import { Client, Databases } from 'appwrite';

// Detect if the required public env vars are present. If not, we stay in demo mode.
const isAppwriteReady = Boolean(
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
);

if (!isAppwriteReady) {
  console.warn('[Appwrite] Missing public environment variables – falling back to demo mode.');
}

// Initialise client – even in demo mode we still create a client instance; calls will fail gracefully.
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '');

const databases = new Databases(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
export { client, databases, isAppwriteReady };
