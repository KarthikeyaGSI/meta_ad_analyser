import 'dotenv/config';
import { db } from './src/server/db';
import { licenses, organizations, plans } from './src/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

async function seedKeys() {
  console.log('Seeding custom keys...');

  let [org] = await db.select().from(organizations).limit(1);
  if (!org) {
    [org] = await db.insert(organizations).values({
      name: 'System Defaults',
      slug: 'system-defaults',
    }).returning();
  }

  let [plan] = await db.select().from(plans).limit(1);
  if (!plan) {
    [plan] = await db.insert(plans).values({
      name: 'Pro',
      code: 'pro_monthly',
      price: 4900,
      billingPeriod: 'monthly'
    }).returning();
  }

  const customKeys = ['karthikeyathallapally', 'marketingko', 'vero'];

  for (const rawKey of customKeys) {
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    console.log(`Inserting key: ${rawKey} with hash: ${keyHash}`);
    
    // Check if exists
    const existing = await db.select().from(licenses).where(eq(licenses.keyHash, keyHash)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(licenses).values({
        organizationId: org.id,
        planId: plan.id,
        keyHash,
        status: 'active',
        durationDays: 30, // 30-day time limit
        maxSeats: 1,
        maxDevices: 2,
      });
      console.log(`Successfully added key: ${rawKey}`);
    } else {
      console.log(`Key ${rawKey} already exists!`);
    }
  }

  console.log('Done!');
  process.exit(0);
}

seedKeys().catch(console.error);
