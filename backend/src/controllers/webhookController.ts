import { Request, Response } from 'express';
import crypto from 'crypto';

// Replace with your actual Meta App Secret
const APP_SECRET = process.env.META_APP_SECRET || 'your_meta_app_secret';
// The verify token you set in your Meta App Dashboard
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'vero_webhook_verify_token';

/**
 * Validates the hub.challenge from Meta to successfully subscribe to Webhooks.
 * Route: GET /api/webhooks/meta
 */
export const verifyMetaWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Webhooks] Meta webhook verified successfully.');
    res.status(200).send(challenge);
  } else {
    console.warn('[Webhooks] Meta webhook verification failed.');
    res.sendStatus(403);
  }
};

/**
 * Receives the live payloads from Meta when ad status changes, leads occur, etc.
 * Route: POST /api/webhooks/meta
 */
export const handleMetaWebhook = (req: Request, res: Response) => {
  // 1. Verify the X-Hub-Signature-256 header (optional but highly recommended for security)
  const signature = req.headers['x-hub-signature-256'] as string;
  if (signature && APP_SECRET) {
    const rawBody = JSON.stringify(req.body); // In production, you should use raw-body middleware
    const expectedSignature = `sha256=${crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`;
    
    if (signature !== expectedSignature) {
      console.warn('[Webhooks] Invalid webhook signature from Meta.');
      // return res.sendStatus(403); // Uncomment in production with proper raw body
    }
  }

  const body = req.body;

  // 2. Acknowledge the webhook immediately to avoid Meta retrying
  res.status(200).send('EVENT_RECEIVED');

  // 3. Process the payload asynchronously
  if (body.object === 'page' || body.object === 'ad_account') {
    body.entry?.forEach((entry: any) => {
      entry.changes?.forEach((change: any) => {
        console.log(`[Webhooks] Received live update for ${body.object}:`, change.field);
        
        // Example Payload Handlers:
        if (change.field === 'campaign_status') {
          // Push update to frontend via SSE / Websockets
          console.log(`Campaign ${change.value.campaign_id} status changed to ${change.value.status}`);
          // e.g. broadcastToClients(change.value.account_id, { type: 'CAMPAIGN_UPDATE', payload: change.value });
        }
        
        if (change.field === 'leadgen') {
          console.log(`New lead received for ad ${change.value.ad_id}`);
        }
      });
    });
  } else {
    console.log('[Webhooks] Received unknown webhook object:', body.object);
  }
};

/**
 * Route: POST /api/webhooks/mock
 * Utility endpoint to trigger a mock webhook so the frontend can test live updates.
 */
export const triggerMockWebhook = (req: Request, res: Response) => {
    const { accountId } = req.body;
    
    console.log(`[Webhooks] Triggering Mock Live Sync for account ${accountId}`);
    
    // In a real scenario, this would push data via Server-Sent Events (SSE) or WebSockets.
    // For this mockup, we just log and return success.
    res.json({
        success: true,
        message: 'Mock webhook payload generated. The frontend should simulate a live data push.'
    });
};
