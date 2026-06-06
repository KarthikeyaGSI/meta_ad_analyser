import { db } from '../db';
import { webhookEvents } from '../db/schema';
import { eq } from 'drizzle-orm';

export class WebhookService {
  static async logEvent(source: string, type: string, payload: any) {
    const [event] = await db.insert(webhookEvents).values({
      source,
      type,
      payload,
      status: 'pending',
    }).returning();
    
    return event;
  }

  static async markProcessed(eventId: string) {
    await db.update(webhookEvents)
      .set({ status: 'processed', processedAt: new Date() })
      .where(eq(webhookEvents.id, eventId));
  }

  static async markFailed(eventId: string) {
    // In real app, we might increment retries and keep pending or move to failed if retries > 3
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, eventId));
    if (event) {
      const newRetries = event.retries + 1;
      await db.update(webhookEvents)
        .set({ 
          retries: newRetries, 
          status: newRetries >= 3 ? 'failed' : 'pending' 
        })
        .where(eq(webhookEvents.id, eventId));
    }
  }
}
