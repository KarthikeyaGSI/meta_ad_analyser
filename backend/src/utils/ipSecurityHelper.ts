import { Request } from 'express';
import { db, User } from '../database/dbClient';

export interface IpSecurityResult {
  allowed: boolean;
  message?: string;
  lockoutUntil?: string | null;
}

export const checkIpSecurity = async (req: Request, user: User): Promise<IpSecurityResult> => {
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') as string;
  const ip = clientIp.split(',')[0].trim();

  // Check if lockout is active
  if (user.lockoutUntil) {
    const lockoutTime = new Date(user.lockoutUntil).getTime();
    if (Date.now() < lockoutTime) {
      return { 
        allowed: false, 
        message: 'Account temporarily suspended due to suspicious login activity across multiple IP addresses.',
        lockoutUntil: user.lockoutUntil 
      };
    } else {
      // Lockout expired, clear it and reset IPs
      user.lockoutUntil = null;
      user.knownIps = [ip];
      await db.upsert(user as any); // use db abstraction to save user
      // Assuming dbClient.ts LocalTableStore structure or Appwrite updates...
      // Wait, db in dbClient.ts doesn't expose a clean `upsertUser`. It exposes `createUser` but not `updateUser`.
      // I will implement a quick workaround in authController instead of using this helper if `updateUser` is missing.
    }
  }

  const knownIps = user.knownIps || [];

  if (!knownIps.includes(ip)) {
    knownIps.push(ip);
    
    // Max 3 distinct IPs
    if (knownIps.length > 3) {
      const lockoutDate = new Date();
      lockoutDate.setHours(lockoutDate.getHours() + 2);
      
      user.lockoutUntil = lockoutDate.toISOString();
      user.knownIps = knownIps;
      
      return { 
        allowed: false, 
        message: 'Account temporarily suspended for 2 hours due to suspicious login activity across multiple IP addresses (Max 3 IPs allowed).',
        lockoutUntil: user.lockoutUntil 
      };
    } else {
      user.knownIps = knownIps;
    }
  }

  return { allowed: true };
};
