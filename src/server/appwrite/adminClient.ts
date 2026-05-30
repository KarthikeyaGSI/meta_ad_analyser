import { Client as ServerSDK, Databases as ServerDatabases, Users as ServerUsers, Account as ServerAccount } from 'node-appwrite';

const MOCK_MODE = !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// SERVER SDK (for Node backend/API routes ONLY)
export function createAdminClient() {
  const adminClient = new ServerSDK();
  if (!MOCK_MODE) {
    adminClient
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY || '');
  }
  return {
    get account() {
      return new ServerAccount(adminClient);
    },
    get databases() {
      return new ServerDatabases(adminClient);
    },
    get users() {
      return new ServerUsers(adminClient);
    }
  };
}
