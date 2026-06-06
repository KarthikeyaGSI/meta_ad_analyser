'use server';

import { db } from '@/server/db';
import { licenses, organizations, plans } from '@/server/db/schema';
import crypto from 'crypto';

export async function generateActivationKey(formData: FormData) {
  try {
    const durationDays = parseInt(formData.get('durationDays') as string || '30');
    const maxSeats = parseInt(formData.get('maxSeats') as string || '1');
    const planIdStr = formData.get('planId') as string;

    // We must find or create a default organization for generic keys
    let [org] = await db.select().from(organizations).limit(1);
    if (!org) {
      [org] = await db.insert(organizations).values({
        name: 'System Defaults',
        slug: 'system-defaults',
      }).returning();
    }

    let planId = planIdStr;
    if (!planId) {
      // Find default plan
      const [plan] = await db.select().from(plans).limit(1);
      if (!plan) {
         const [newPlan] = await db.insert(plans).values({
            name: 'Pro',
            code: 'pro_monthly',
            price: 4900,
            billingPeriod: 'monthly'
         }).returning();
         planId = newPlan.id;
      } else {
        planId = plan.id;
      }
    }

    // Generate Key
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
    }
    const rawKey = `VERO-${segments.join('-')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Insert into DB
    const [license] = await db.insert(licenses).values({
      organizationId: org.id,
      planId,
      keyHash,
      status: 'active',
      durationDays,
      maxSeats,
      maxDevices: maxSeats * 2,
    }).returning();

    return { success: true, rawKey };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPlans() {
  return db.select().from(plans);
}
