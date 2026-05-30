import crypto from 'crypto';
import { cookies } from 'next/headers';

const ALGORITHM = 'aes-256-gcm';
// In production, this should be a 32-byte key from environment variables.
const SECRET_KEY = process.env.JWT_SECRET 
  ? crypto.createHash('sha256').update(String(process.env.JWT_SECRET)).digest('base64').substring(0, 32)
  : crypto.randomBytes(32); 

export async function encryptToken(text: string): Promise<string> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export async function decryptToken(encryptedText: string): Promise<string | null> {
  try {
    const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const encrypted = await encryptToken(token);
  (cookies() as any).set({
    name: 'meta_access_token',
    value: encrypted,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookie = (cookies() as any).get('meta_access_token');
  if (!cookie?.value) return null;
  return await decryptToken(cookie.value);
}

export function clearAuthCookie() {
  (cookies() as any).delete('meta_access_token');
}
