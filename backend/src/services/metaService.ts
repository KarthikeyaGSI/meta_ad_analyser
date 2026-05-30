import { db, Campaign, Adset, Ad, Creative, DailyInsight, HourlyInsight, MetaAccount, SyncSession } from '../database/dbClient';
import { SandboxEngine } from './sandboxEngine';

export class MetaApiService {
  private static BASE_URL = 'https://graph.facebook.com/v25.0';

  /**
   * Exchanges authorization code for long-lived access token
   */
  static async exchangeCodeForToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI;

    // Check if we are running in OAuth sandbox mode or using mock credentials
    if (!appId || !appSecret) {
      throw new Error('Missing Meta App ID or App Secret.');
    }

    try {
      const url = `${this.BASE_URL}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&client_secret=${appSecret}&code=${code}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Token exchange failed');
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
      };
    } catch (error: any) {
      console.error('[Meta API] Live OAuth exchange failed:', error);
      throw error;
    }
  }

  /**
   * Fetches ad accounts connected to the token
   */
  static async fetchAdAccounts(accessToken: string): Promise<Array<{ id: string; name: string }>> {


    try {
      const res = await fetch(`${this.BASE_URL}/me/adaccounts?fields=name,account_id&access_token=${accessToken}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      return (data.data || []).map((acc: any) => ({
        id: `act_${acc.account_id}`,
        name: acc.name || `Ad Account ${acc.account_id}`,
      }));
    } catch (err) {
      console.error('[Meta API] Failed to fetch live accounts.');
      throw err;
    }
  }

  /**
   * Full Sync flow: Sync campaigns, adsets, ads, creatives and insights.
   */
  static async syncAdAccount(accountId: string, accessToken: string): Promise<void> {
    console.log(`[Meta API] Starting synchronization engine for account: ${accountId}`);

    const sessionId = `sync-sess-${Date.now()}`;
    const startTimestamp = Date.now();

    // Create and save PENDING/RUNNING sync session state explicitly typed
    const currentSession: SyncSession = {
      id: sessionId,
      metaAccountId: accountId,
      status: 'RUNNING',
      rowsProcessed: 0,
      durationMs: 0,
      createdAt: new Date().toISOString()
    };
    await db.upsertSyncSession(currentSession);



    try {
      let syncedRowsCount = 0;

      // Extract the real Meta Ad Account ID (e.g. act_xxxxxxxx) from our internal account ID
      const metaActId = accountId.startsWith('ma-direct-') 
        ? accountId.replace('ma-direct-', '')
        : accountId.startsWith('ma-')
          ? accountId.replace('ma-', '')
          : accountId;

      // --- 1. FETCH CAMPAIGNS ---
      console.log('[Meta API] Syncing campaigns...');
      const campUrl = `${this.BASE_URL}/${metaActId}/campaigns?fields=name,status,objective,buying_type,daily_budget,lifetime_budget,created_time&access_token=${accessToken}&limit=100`;
      const campRes = await fetch(campUrl);
      const campData = await campRes.json();
      if (campData.error) throw new Error(campData.error.message);

      const dbCampaigns: Campaign[] = (campData.data || []).map((c: any) => ({
        id: `c-${c.id}`,
        metaAccountId: accountId,
        campaignId: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        buyingType: c.buying_type,
        budget: Number(c.daily_budget || c.lifetime_budget || 0) / 100, // cents to main
        createdTime: c.created_time,
      }));

      if (dbCampaigns.length > 0) {
        await db.upsertCampaigns(dbCampaigns);
        syncedRowsCount += dbCampaigns.length;
      }

      // --- 2. FETCH ADSETS ---
      console.log('[Meta API] Syncing adsets...');
      const adsetUrl = `${this.BASE_URL}/${metaActId}/adsets?fields=name,status,campaign,targeting,daily_budget,lifetime_budget&access_token=${accessToken}&limit=150`;
      const adsetRes = await fetch(adsetUrl);
      const adsetData = await adsetRes.json();
      if (adsetData.error) throw new Error(adsetData.error.message);

      const dbAdsets: Adset[] = (adsetData.data || []).map((as: any) => ({
        id: `as-${as.id}`,
        campaignId: `c-${as.campaign?.id}`,
        adsetId: as.id,
        name: as.name,
        status: as.status,
        targeting: as.targeting || {},
        budget: Number(as.daily_budget || as.lifetime_budget || 0) / 100,
      }));

      if (dbAdsets.length > 0) {
        await db.upsertAdsets(dbAdsets);
        syncedRowsCount += dbAdsets.length;
      }

      // --- 3. FETCH ADS ---
      console.log('[Meta API] Syncing ads...');
      const adUrl = `${this.BASE_URL}/${metaActId}/ads?fields=name,status,adset,creative&access_token=${accessToken}&limit=300`;
      const adRes = await fetch(adUrl);
      const adData = await adRes.json();
      if (adData.error) throw new Error(adData.error.message);

      const dbAds: Ad[] = (adData.data || []).map((ad: any) => ({
        id: `ad-${ad.id}`,
        adsetId: `as-${ad.adset?.id}`,
        adId: ad.id,
        name: ad.name,
        status: ad.status,
        creativeId: ad.creative?.id || '',
      }));

      if (dbAds.length > 0) {
        await db.upsertAds(dbAds);
        syncedRowsCount += dbAds.length;
      }

      // --- 4. FETCH AD CREATIVES ---
      console.log('[Meta API] Syncing creatives...');
      const creativeUrl = `${this.BASE_URL}/${metaActId}/adcreatives?fields=name,title,body,image_url,video_id,thumbnail_url,call_to_action_type&access_token=${accessToken}&limit=100`;
      const creativeRes = await fetch(creativeUrl);
      const creativeData = await creativeRes.json();
      if (creativeData.error) throw new Error(creativeData.error.message);

      const dbCreatives: Creative[] = (creativeData.data || []).map((cr: any) => ({
        id: cr.id,
        creativeId: cr.id,
        name: cr.name || `Creative ${cr.id}`,
        headline: cr.title || '',
        body: cr.body || '',
        imageUrl: cr.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400',
        thumbnailUrl: cr.thumbnail_url || cr.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=200',
        callToActionType: cr.call_to_action_type || 'SHOP_NOW',
      }));

      if (dbCreatives.length > 0) {
        await db.upsertCreatives(dbCreatives);
        syncedRowsCount += dbCreatives.length;
      }

      // --- 5. FETCH DAILY INSIGHTS (Last 180 Days) ---
      console.log('[Meta API] Syncing 180-day daily insights...');
      const dateRangeStr = JSON.stringify({ since: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], until: new Date().toISOString().split('T')[0] });
      const insightsFields = 'campaign_id,spend,impressions,clicks,actions,action_values,frequency';
      const insightsUrl = `${this.BASE_URL}/${metaActId}/insights?level=campaign&fields=${insightsFields}&time_range=${encodeURIComponent(dateRangeStr)}&time_increment=1&access_token=${accessToken}&limit=500`;
      const insightsRes = await fetch(insightsUrl);
      const insightsData = await insightsRes.json();
      if (insightsData.error) throw new Error(insightsData.error.message);

      const parsedDailyInsights: DailyInsight[] = (insightsData.data || []).map((row: any) => {
        const spend = Number(row.spend || 0);
        const impressions = Number(row.impressions || 0);
        const clicks = Number(row.clicks || 0);
        
        // Extract actions (purchases counts)
        let purchases = 0;
        let revenue = 0;
        const actions = row.actions || [];
        
        const purchaseAction = actions.find((act: any) => act.action_type === 'purchase' || act.action_type === 'offsite_conversion.fb_pixel_purchase');
        if (purchaseAction) {
          purchases = Number(purchaseAction.value || 0);
        }

        // Extract action_values (monetary conversion revenues from live pixel events)
        const actionValues = row.action_values || [];
        const purchaseValueAction = actionValues.find((act: any) => act.action_type === 'purchase' || act.action_type === 'offsite_conversion.fb_pixel_purchase');
        if (purchaseValueAction) {
          revenue = Number(purchaseValueAction.value || 0);
        } else {
          // Fallback only if counts exist but pixel values are missing
          revenue = purchases * 85;
        }

        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
        const roas = spend > 0 ? revenue / spend : 0;
        const cpa = purchases > 0 ? spend / purchases : 0;

        return {
          id: `di-${row.campaign_id}-${row.date_start}`,
          entityType: 'CAMPAIGN',
          entityId: row.campaign_id,
          date: row.date_start,
          spend,
          impressions,
          clicks,
          purchases,
          revenue,
          ctr: parseFloat(ctr.toFixed(2)),
          cpc: parseFloat(cpc.toFixed(2)),
          cpm: parseFloat(cpm.toFixed(2)),
          roas: parseFloat(roas.toFixed(2)),
          cpa: parseFloat(cpa.toFixed(2)),
          frequency: Number(row.frequency || 1.1),
        };
      });

      if (parsedDailyInsights.length > 0) {
        await db.upsertDailyInsights(parsedDailyInsights);
        syncedRowsCount += parsedDailyInsights.length;
      }

      // Update sync session log as successful
      currentSession.status = 'COMPLETED';
      currentSession.rowsProcessed = syncedRowsCount;
      currentSession.durationMs = Date.now() - startTimestamp;
      await db.upsertSyncSession(currentSession);

      console.log(`[Meta API] Synchronization complete for live account: ${accountId}. Synced Rows: ${syncedRowsCount}`);
    } catch (err: any) {
      console.error(`[Meta API] Live synchronization failed for account ${accountId}:`, err);
      


      // Update session as failed, logging raw stack
      currentSession.status = 'FAILED';
      currentSession.durationMs = Date.now() - startTimestamp;
      currentSession.errorMessage = err.message || 'API link lost during transfer.';
      await db.upsertSyncSession(currentSession);

      // Enforce zero sandbox fallback in live mode by throwing the error back to the caller
      throw err;
    }
  }
}
