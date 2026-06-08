import { db } from '../db';
import { licenses, licenseActivations, licenseDevices, auditLogs, plans, planFeatures } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://mock-redis-url.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'mock-token',
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only');

export class LicenseService {
  static generateKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    return `VERO-${segments.join('-')}`;
  }

  static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  static async generateLicenseJWT(activation: typeof licenseActivations.$inferSelect, license: typeof licenses.$inferSelect, planCode: string) {
    const jwt = await new SignJWT({
      activationId: activation.id,
      licenseId: license.id,
      organizationId: license.organizationId,
      plan: planCode,
      seatLimit: license.maxSeats,
      deviceLimit: license.maxDevices,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(activation.expiresAt)
      .sign(JWT_SECRET);
      
    return jwt;
  }

  static async validateActivation(key: string, deviceFingerprint: string, userId: string) {
    const hashedKey = this.hashKey(key);
    
    // Find license (soft delete aware)
    const [license] = await db.select()
      .from(licenses)
      .where(and(eq(licenses.keyHash, hashedKey), isNull(licenses.deletedAt)));
      
    if (!license) throw new Error('Invalid license key');
    if (license.status === 'revoked') throw new Error('License has been revoked');
    if (license.status === 'frozen') throw new Error('License account is frozen');
    
    // Check expiration with Grace Period
    const now = new Date();
    const effectiveExpiration = new Date(license.createdAt);
    effectiveExpiration.setDate(effectiveExpiration.getDate() + license.durationDays + license.gracePeriodDays);
    if (now > effectiveExpiration) {
      // It's fully expired beyond grace period
      await db.update(licenses).set({ status: 'expired' }).where(eq(licenses.id, license.id));
      throw new Error('License has expired completely');
    }

    // Check existing activations
    const existingActivations = await db.select()
      .from(licenseActivations)
      .where(and(
        eq(licenseActivations.licenseId, license.id),
        eq(licenseActivations.status, 'active')
      ));

    // If the user already has an active activation for this license, we can bypass the limit or return existing.
    // For simplicity, if they already have an activation, we don't count them as a new seat.
    const userHasActivation = existingActivations.some(a => a.userId === userId);

    if (!userHasActivation && existingActivations.length >= license.maxSeats) {
      // Auto-cleanup: If in development or testing, let's automatically revoke the oldest to prevent deadlocks
      if (process.env.NODE_ENV !== 'production' || license.maxSeats < 5) {
        const oldestActivation = existingActivations.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())[0];
        if (oldestActivation) {
          await db.update(licenseActivations)
            .set({ status: 'revoked' })
            .where(eq(licenseActivations.id, oldestActivation.id));
        }
      } else {
        throw new Error(`Activation Failed: This license has reached its maximum usage limit of ${license.maxSeats} seats. All seats are currently assigned to active team members. Please upgrade your plan or ask an administrator to revoke inactive devices to free up a seat.`);
      }
    }

    // Process Activation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + license.durationDays); // Activation expiry doesn't include grace until needed

    const [activation] = await db.insert(licenseActivations).values({
      licenseId: license.id,
      userId,
      status: 'active',
      expiresAt,
    }).returning();

    // Register device
    await db.insert(licenseDevices).values({
      activationId: activation.id,
      deviceId: deviceFingerprint,
      userAgent: 'unknown',
      ipAddress: '0.0.0.0'
    });

    // Audit log
    await db.insert(auditLogs).values({
      organizationId: license.organizationId,
      userId,
      action: 'LICENSE_ACTIVATION',
      entityType: 'license',
      entityId: license.id,
      metadata: { deviceFingerprint }
    });

    // Get Plan context for JWT and Caching
    const [plan] = await db.select().from(plans).where(eq(plans.id, license.planId));
    
    // Generate JWT
    const jwtToken = await this.generateLicenseJWT(activation, license, plan.code);

    // Cache active license metadata in Redis for Edge lookups
    await redis.set(`active_license:${activation.id}`, JSON.stringify({
      status: 'active',
      plan: plan.code,
      organizationId: license.organizationId,
    }), { ex: 86400 }); // 24h cache, DB becomes fallback

    return { activation, jwtToken };
  }

  static async syncLicense(userId: string) {
    const userActivations = await db.select()
      .from(licenseActivations)
      .where(and(eq(licenseActivations.userId, userId), eq(licenseActivations.status, 'active')));

    if (userActivations.length === 0) return null;
    const activation = userActivations[0];

    // Check if expired
    if (new Date() > new Date(activation.expiresAt)) {
      await db.update(licenseActivations).set({ status: 'expired' }).where(eq(licenseActivations.id, activation.id));
      return null;
    }

    const [license] = await db.select().from(licenses).where(eq(licenses.id, activation.licenseId));
    if (!license || license.status !== 'active') return null;

    const [plan] = await db.select().from(plans).where(eq(plans.id, license.planId));
    
    const jwtToken = await this.generateLicenseJWT(activation, license, plan.code);
    return { activation, jwtToken };
  }
}
