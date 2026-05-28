import { Client as ClientSDK, Databases as ClientDatabases, Account as ClientAccount } from 'appwrite';

const MOCK_MODE = !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// CLIENT SDK (for browser)
const client = new ClientSDK();
if (!MOCK_MODE) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
} else {
  console.warn('⚠️ APPWRITE ENV VARS MISSING. Running in MOCK mode.');
}

const realDatabases = new ClientDatabases(client);
const realAccount = new ClientAccount(client);

export const safeDatabases = {
  listDocuments: async (databaseId: string, collectionId: string, queries?: any[]) => {
    if (MOCK_MODE) {
      return { total: 0, documents: [] };
    }
    try {
      return await realDatabases.listDocuments(databaseId, collectionId, queries);
    } catch (error) {
      console.error('[Appwrite] listDocuments failed:', error);
      return { total: 0, documents: [] };
    }
  },
  createDocument: async (databaseId: string, collectionId: string, documentId: string, data: any) => {
    if (MOCK_MODE) {
      return { $id: documentId, ...data };
    }
    try {
      return await realDatabases.createDocument(databaseId, collectionId, documentId, data);
    } catch (error) {
      console.error('[Appwrite] createDocument failed:', error);
      return { $id: documentId, ...data }; 
    }
  }
};

export const safeAccount = {
  get: async () => {
    if (MOCK_MODE) {
      return { $id: 'mock-user-1', name: 'Mock User', email: 'mock@example.com' };
    }
    try {
      return await realAccount.get();
    } catch (error) {
      console.error('[Appwrite] account.get failed:', error);
      throw error; 
    }
  }
};

export { client as appwriteClient };
