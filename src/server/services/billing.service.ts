import { db } from '../db';
import { customers, subscriptions, plans, licenses } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { LicenseService } from './license.service';

export class BillingService {
  /**
   * Provisions a new subscription and automatically generates the associated license
   */
  static async createSubscription(organizationId: string, planCode: string, billingEmail: string) {
    // Lookup plan
    const [plan] = await db.select().from(plans).where(eq(plans.code, planCode));
    if (!plan) throw new Error('Plan not found');

    // Ensure customer exists
    let [customer] = await db.select().from(customers).where(eq(customers.organizationId, organizationId));
    
    if (!customer) {
      [customer] = await db.insert(customers).values({
        organizationId,
        billingEmail,
      }).returning();
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (plan.billingPeriod === 'yearly' ? 12 : 1));

    // Create Subscription
    const [subscription] = await db.insert(subscriptions).values({
      customerId: customer.id,
      organizationId,
      planId: plan.id,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
    }).returning();

    // Generate Associated License
    const licenseKey = LicenseService.generateKey();
    const keyHash = LicenseService.hashKey(licenseKey);

    const [license] = await db.insert(licenses).values({
      organizationId,
      subscriptionId: subscription.id,
      planId: plan.id,
      keyHash,
      status: 'active',
      durationDays: plan.billingPeriod === 'yearly' ? 365 : 30,
      maxSeats: planCode.includes('enterprise') ? 9999 : (planCode.includes('agency') ? 10 : 3),
      maxDevices: planCode.includes('enterprise') ? 9999 : 5,
    }).returning();

    return { subscription, license, rawKey: licenseKey };
  }
}
