import axios from 'axios';
import { createAdminClient } from '../appwrite/adminClient';
import { ID } from 'node-appwrite';

const META_API_BASE = 'https://graph.facebook.com/v19.0';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const CAMPAIGNS_COLLECTION = 'campaigns';
const INSIGHTS_COLLECTION = 'insights';

export async function fetchAndStoreMetaCampaigns(accountId: string, token: string) {
  try {
    const actId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    
    // 1. Fetch Campaigns from Meta
    const campaignsRes = await axios.get(`${META_API_BASE}/${actId}/campaigns`, {
      params: {
        access_token: token,
        fields: 'id,name,status,objective,daily_budget,lifetime_budget,spend_cap',
        limit: 100
      }
    });
    const campaigns = campaignsRes.data.data;

    if (!campaigns || campaigns.length === 0) {
      console.log(`No campaigns found for account ${actId}`);
      return [];
    }

    // 2. Fetch Insights for those campaigns
    const insightsRes = await axios.get(`${META_API_BASE}/${actId}/insights`, {
      params: {
        access_token: token,
        level: 'campaign',
        fields: 'campaign_id,spend,impressions,clicks,cpc,cpm,ctr,actions,action_values',
        date_preset: 'last_30d',
        limit: 100
      }
    });
    
    const insights = insightsRes.data.data;
    const insightsMap = new Map();
    for (const insight of insights) {
      insightsMap.set(insight.campaign_id, insight);
    }

    // 3. Store in Appwrite
    const { databases } = createAdminClient();
    
    const storedCampaigns = [];
    for (const camp of campaigns) {
      const insight = insightsMap.get(camp.id) || {};
      
      const purchases = insight.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;
      const purchaseValue = insight.action_values?.find((a: any) => a.action_type === 'purchase')?.value || 0;
      const roas = purchaseValue && insight.spend ? (Number(purchaseValue) / Number(insight.spend)) : 0;
      const cpa = purchases && insight.spend ? (Number(insight.spend) / Number(purchases)) : 0;

      const docData = {
        meta_id: camp.id,
        account_id: actId,
        name: camp.name,
        status: camp.status,
        spend: Number(insight.spend || 0),
        impressions: Number(insight.impressions || 0),
        clicks: Number(insight.clicks || 0),
        cpc: Number(insight.cpc || 0),
        cpm: Number(insight.cpm || 0),
        ctr: Number(insight.ctr || 0) * 100, // Meta returns decimal
        purchases: Number(purchases),
        revenue: Number(purchaseValue),
        roas: Number(roas),
        cpa: Number(cpa),
        last_synced: new Date().toISOString()
      };

      try {
        if (DATABASE_ID) {
          // In a real scenario we'd upsert based on meta_id. For simplicity, we just create.
          await databases.createDocument(DATABASE_ID, CAMPAIGNS_COLLECTION, ID.unique(), docData);
        }
      } catch (dbErr) {
        console.error(`Failed to store campaign ${camp.id} in DB:`, dbErr);
      }
      
      storedCampaigns.push(docData);
    }

    console.log(`Synced ${storedCampaigns.length} campaigns for ${actId}`);
    return storedCampaigns;

  } catch (error: any) {
    console.error('Meta API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to sync with Meta');
  }
}
