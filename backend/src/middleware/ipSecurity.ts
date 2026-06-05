import { Request, Response, NextFunction } from 'express';
import { db } from '../database/dbClient';

export const ipSecurityGuard = async (req: Request, res: Response, next: NextFunction) => {
  // Try to get IP from headers or connection
  const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') as string;
  const ip = clientIp.split(',')[0].trim();

  // We only track this AFTER auth middleware if user exists, OR we can inject it into the auth routes
  // Wait, if it's placed after `authMiddleware`, `req.user` will exist.
  const userReq = req as any;
  if (!userReq.user || !userReq.user.id) {
    return next();
  }

  const userId = userReq.user.id;

  try {
    const user = await db.getUserById(userId);
    if (!user) return next();

    // Check if lockout is active
    if (user.lockoutUntil) {
      const lockoutTime = new Date(user.lockoutUntil).getTime();
      if (Date.now() < lockoutTime) {
        return res.status(403).json({ 
          message: 'Account temporarily suspended due to suspicious login activity across multiple IP addresses.',
          lockoutUntil: user.lockoutUntil 
        });
      } else {
        // Lockout expired, clear it
        user.lockoutUntil = null;
        user.knownIps = [ip]; // Reset IP list to current IP to prevent instant re-lock
        await db.updateUser(user);
      }
    }

    const knownIps = user.knownIps || [];

    if (!knownIps.includes(ip)) {
      knownIps.push(ip);
      
      // If they exceeded 3 distinct IPs, trigger a 2 hour lockout
      if (knownIps.length > 3) {
        const lockoutDate = new Date();
        lockoutDate.setHours(lockoutDate.getHours() + 2);
        
        user.lockoutUntil = lockoutDate.toISOString();
        user.knownIps = knownIps; // Update the list
        await db.updateUser(user);

        return res.status(403).json({ 
          message: 'Account temporarily suspended for 2 hours due to suspicious login activity across multiple IP addresses (Max 3 IPs allowed).',
          lockoutUntil: user.lockoutUntil 
        });
      } else {
        // Just update known IPs
        user.knownIps = knownIps;
        await db.updateUser(user);
      }
    }

    next();
  } catch (err) {
    console.error('IP Security error:', err);
    next();
  }
};
