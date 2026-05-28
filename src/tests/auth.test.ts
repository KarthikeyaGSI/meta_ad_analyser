import { encryptToken, decryptToken } from '../server/auth/token';

describe('Auth Token Encryption', () => {
  it('should encrypt and decrypt token correctly', async () => {
    const originalToken = 'meta-super-secret-token-12345';
    
    const encrypted = await encryptToken(originalToken);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(originalToken);
    
    const decrypted = await decryptToken(encrypted);
    expect(decrypted).toEqual(originalToken);
  });

  it('should return null for malformed tokens', async () => {
    const decrypted = await decryptToken('invalid-token-format');
    expect(decrypted).toBeNull();
  });
});
