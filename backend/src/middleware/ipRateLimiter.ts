import { Request, Response, NextFunction } from 'express';
import { Redis } from '@upstash/redis';

// Initialize Redis client. If UPSTASH_REDIS_REST_URL is missing, it will log a warning and bypass locking.
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } else {
    console.warn('[Security] UPSTASH_REDIS_REST_URL or TOKEN not found. IP Rate Limiting is bypassed.');
  }
} catch (error) {
  console.error('[Security] Failed to initialize Redis client:', error);
}

const MAX_IPS_PER_ACCOUNT = 3;
const LOCKOUT_DURATION_SECONDS = 2 * 60 * 60; // 2 hours default
const IP_TRACKING_WINDOW_SECONDS = 24 * 60 * 60; // Track IPs over 24 hours

export const ipRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  // If Redis is not configured, bypass the rate limiter
  if (!redis) {
    return next();
  }

  try {
    // Extract user ID from the request if authenticated
    // Note: This requires the middleware to run AFTER authentication for protected routes,
    // OR extract it from the login payload for the /auth/login route.
    let userId = (req as any).user?.id;
    
    if (!userId && req.path.includes('/auth/login') && req.body?.email) {
      // Use email as a proxy for user ID during login attempt
      userId = req.body.email;
    }

    if (!userId) {
      return next(); // Cannot track without an identity
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (ip === 'unknown') return next();

    // Check if the account is currently locked
    const lockKey = `lockout:${userId}`;
    const isLocked = await redis.get(lockKey);
    
    if (isLocked) {
      return res.status(403).json({ 
        message: 'Account temporarily suspended due to security lockout. Multiple IPs detected. Please contact support.' 
      });
    }

    // Track the IP for this user
    const trackingKey = `ips:${userId}`;
    
    // Add IP to the Set in Redis
    await redis.sadd(trackingKey, ip.toString());
    // Ensure the key expires after the tracking window to prevent permanent buildup
    await redis.expire(trackingKey, IP_TRACKING_WINDOW_SECONDS);

    // Get the count of unique IPs
    const uniqueIpsCount = await redis.scard(trackingKey);

    if (uniqueIpsCount > MAX_IPS_PER_ACCOUNT) {
      console.warn(`[Security] Account ${userId} locked. Exceeded max IPs (${uniqueIpsCount}).`);
      
      // Set lockout flag
      await redis.set(lockKey, 'locked', { ex: LOCKOUT_DURATION_SECONDS });
      
      // Also clear the IP list so they start fresh after lockout expires
      await redis.del(trackingKey);

      return res.status(403).json({ 
        message: 'Account suspended due to policy violation: Too many IP addresses detected. Lockout duration: 2 hours.' 
      });
    }

    next();
  } catch (error) {
    console.error('[Security] Redis rate limiter error:', error);
    // Fail open to avoid blocking legitimate users if Redis goes down
    next();
  }
};
