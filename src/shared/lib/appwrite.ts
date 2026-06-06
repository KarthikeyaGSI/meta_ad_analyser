import { Client, Databases } from 'appwrite';
import { hasAppwrite, enableSandbox } from './runtime';

if (enableSandbox) {
  console.warn('[Appwrite] Missing public environment variables – falling back to demo mode.');
}

let client: Client | null = null;
let databases: Databases | null = null;

try {
  if (
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT &&
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  ) {
    client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
      
    databases = new Databases(client);
  }
} catch {
  databases = null;
}

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? '';
export { client, databases, hasAppwrite as isAppwriteReady };
