import { safeDatabases, safeAccount } from '../server/appwrite/safeClient';

describe('Appwrite Safe Client', () => {
  it('should return mock data when listDocuments is called in mock mode or fails', async () => {
    const result = await safeDatabases.listDocuments('db1', 'col1');
    expect(result.total).toBe(0);
    expect(result.documents).toEqual([]);
  });

  it('should return mock data when createDocument is called in mock mode or fails', async () => {
    const data = { foo: 'bar' };
    const result = await safeDatabases.createDocument('db1', 'col1', 'doc1', data);
    expect(result.$id).toBe('doc1');
    expect(result.foo).toBe('bar');
  });

  it('should return mock user for account.get in mock mode', async () => {
    const user = await safeAccount.get();
    expect(user.$id).toBe('mock-user-1');
  });
});
