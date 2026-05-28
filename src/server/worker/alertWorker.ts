import { analyticsApi } from '../../services/api';

export async function runAlertWorker() {
  console.log('[AlertWorker] Scanning for campaign anomalies...');
  
  try {
    // In a real scenario, this would query Appwrite for all active users/accounts
    // For this prototype, we'll assume we have a list of active account IDs
    const mockActiveAccounts = ['act_123456789']; 
    
    for (const accountId of mockActiveAccounts) {
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const res = await analyticsApi.getCampaigns(accountId, lastWeek, today, { limit: 50 });
      const campaigns = res.data?.list || [];
      
      const bleedingCampaigns = campaigns.filter((c: CampaignData) => c.spend > 50 && c.roas < 1.5);
      
      if (bleedingCampaigns.length > 0) {
        await dispatchAlert(accountId, bleedingCampaigns);
      }
    }
    
    console.log('[AlertWorker] Scan complete.');
  } catch (error) {
    console.error('[AlertWorker] Error:', error);
  }
}

interface CampaignData {
  name: string;
  spend: number;
  roas: number;
}

async function dispatchAlert(accountId: string, bleedingCampaigns: CampaignData[]) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.log('[AlertWorker] No Slack webhook configured. Skipping alert for account:', accountId);
    return;
  }
  
  const text = `🚨 *High Budget Bleed Detected* 🚨\nAccount: ${accountId}\n\n` + 
    bleedingCampaigns.map(c => `• *${c.name}*\n  Spend: $${c.spend} | ROAS: ${c.roas}x`).join('\n\n');
    
  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    console.log('[AlertWorker] Alert dispatched successfully.');
  } catch (error) {
    console.error('[AlertWorker] Failed to dispatch alert:', error);
  }
}
