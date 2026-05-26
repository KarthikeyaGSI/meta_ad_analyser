import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Setup directories for dynamic file database fallback
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Global configurations
const DATABASE_URL = process.env.DATABASE_URL;
let pgPool: Pool | null = null;

if (DATABASE_URL) {
  try {
    pgPool = new Pool({ connectionString: DATABASE_URL });
    console.log('[Aetheris DB] Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('[Aetheris DB] PostgreSQL connection failed. Falling back to Local JSON DB.', error);
  }
} else {
  console.log('[Aetheris DB] Running in Sandbox mode with Local JSON Database.');
}

// ----------------------------------------------------
// DATABASE SCHEMAS & TYPES
// ----------------------------------------------------
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaAccount {
  id: string;
  userId: string;
  actId: string;
  name: string;
  accessToken: string;
  status: string;
  currency: string;
  timezone: string;
  lastSyncedAt: string;
}

export interface Campaign {
  id: string;
  metaAccountId: string;
  campaignId: string;
  name: string;
  status: string;
  objective: string;
  buyingType: string;
  budget: number;
  createdTime: string;
}

export interface Adset {
  id: string;
  campaignId: string;
  adsetId: string;
  name: string;
  status: string;
  targeting: any;
  budget: number;
}

export interface Ad {
  id: string;
  adsetId: string;
  adId: string;
  name: string;
  status: string;
  creativeId: string;
}

export interface Creative {
  id: string;
  creativeId: string;
  name: string;
  headline: string;
  body: string;
  imageUrl: string;
  videoUrl?: string;
  callToActionType: string;
  thumbnailUrl: string;
}

export interface DailyInsight {
  id: string;
  entityType: 'CAMPAIGN' | 'ADSET' | 'AD';
  entityId: string; // The specific Campaign, Adset, or Ad Meta ID
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  cpa: number;
  frequency: number;
  deviceBreakdown?: any;
  placementBreakdown?: any;
  demographics?: any;
}

export interface HourlyInsight {
  id: string;
  entityType: 'CAMPAIGN' | 'ADSET' | 'AD';
  entityId: string;
  timestamp: string; // ISO String for hourly aggregation
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  cpa: number;
}

export interface SyncSession {
  id: string;
  metaAccountId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  rowsProcessed: number;
  durationMs: number;
  errorMessage?: string;
  createdAt: string;
}

// ----------------------------------------------------
// LOCAL JSON STORE UTILITY
// ----------------------------------------------------
class LocalTableStore<T extends { id: string }> {
  private filePath: string;

  constructor(tableName: string) {
    this.filePath = path.join(DATA_DIR, `${tableName}.json`);
    if (!fs.existsSync(this.filePath)) {
      this.save([]);
    }
  }

  getAll(): T[] {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch {
      return [];
    }
  }

  save(data: T[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  upsert(item: T): void {
    const list = this.getAll();
    const index = list.findIndex((x) => x.id === item.id);
    if (index > -1) {
      list[index] = { ...list[index], ...item };
    } else {
      list.push(item);
    }
    this.save(list);
  }

  upsertMany(items: T[]): void {
    const list = this.getAll();
    for (const item of items) {
      const index = list.findIndex((x) => x.id === item.id);
      if (index > -1) {
        list[index] = { ...list[index], ...item };
      } else {
        list.push(item);
      }
    }
    this.save(list);
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  findOne(predicate: (item: T) => boolean): T | undefined {
    return this.getAll().find(predicate);
  }
}

// Initialize tables
const usersStore = new LocalTableStore<User>('users');
const metaAccountsStore = new LocalTableStore<MetaAccount>('meta_accounts');
const campaignsStore = new LocalTableStore<Campaign>('campaigns');
const adsetsStore = new LocalTableStore<Adset>('adsets');
const adsStore = new LocalTableStore<Ad>('ads');
const creativesStore = new LocalTableStore<Creative>('creatives');
const dailyInsightsStore = new LocalTableStore<DailyInsight>('insights_daily');
const hourlyInsightsStore = new LocalTableStore<HourlyInsight>('insights_hourly');
const syncSessionsStore = new LocalTableStore<SyncSession>('sync_sessions');

// ----------------------------------------------------
// DATABASE SERVICE INTERFACE
// ----------------------------------------------------
export const db = {
  // SYNC SESSION METHODS
  async getSyncSessions(metaAccountId: string): Promise<SyncSession[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM sync_sessions WHERE meta_account_id = $1 ORDER BY created_at DESC LIMIT 10', [metaAccountId]);
      return res.rows.map(row => ({
        id: row.id,
        metaAccountId: row.meta_account_id,
        status: row.status,
        rowsProcessed: Number(row.rows_processed),
        durationMs: Number(row.duration_ms),
        errorMessage: row.error_message,
        createdAt: row.created_at
      }));
    }
    return syncSessionsStore.find(s => s.metaAccountId === metaAccountId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  },

  async upsertSyncSession(session: SyncSession): Promise<void> {
    if (pgPool) {
      await pgPool.query(
        `INSERT INTO sync_sessions (id, meta_account_id, status, rows_processed, duration_ms, error_message, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET 
           status = EXCLUDED.status, 
           rows_processed = EXCLUDED.rows_processed, 
           duration_ms = EXCLUDED.duration_ms, 
           error_message = EXCLUDED.error_message`,
        [session.id, session.metaAccountId, session.status, session.rowsProcessed, session.durationMs, session.errorMessage || null, session.createdAt]
      );
      return;
    }
    syncSessionsStore.upsert(session);
  },
  // USER METHODS
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (res.rows[0]) {
        return {
          id: res.rows[0].id,
          email: res.rows[0].email,
          passwordHash: res.rows[0].password_hash,
          name: res.rows[0].name,
          createdAt: res.rows[0].created_at,
          updatedAt: res.rows[0].updated_at,
        };
      }
      return undefined;
    }
    return usersStore.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async createUser(user: User): Promise<User> {
    if (pgPool) {
      await pgPool.query(
        'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [user.id, user.email, user.passwordHash, user.name, user.createdAt, user.updatedAt]
      );
      return user;
    }
    usersStore.upsert(user);
    return user;
  },

  // ACCOUNTS METHODS
  async getAccountsByUserId(userId: string): Promise<MetaAccount[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM meta_accounts WHERE user_id = $1', [userId]);
      return res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        actId: row.act_id,
        name: row.name,
        accessToken: row.access_token,
        status: row.status,
        currency: row.currency,
        timezone: row.timezone,
        lastSyncedAt: row.last_synced_at,
      }));
    }
    return metaAccountsStore.find((a) => a.userId === userId);
  },

  async getAccountById(accountId: string): Promise<MetaAccount | undefined> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM meta_accounts WHERE id = $1', [accountId]);
      if (res.rows[0]) {
        const row = res.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          actId: row.act_id,
          name: row.name,
          accessToken: row.access_token,
          status: row.status,
          currency: row.currency,
          timezone: row.timezone,
          lastSyncedAt: row.last_synced_at,
        };
      }
      return undefined;
    }
    return metaAccountsStore.findOne((a) => a.id === accountId);
  },

  async upsertMetaAccount(account: MetaAccount): Promise<MetaAccount> {
    if (pgPool) {
      await pgPool.query(
        `INSERT INTO meta_accounts (id, user_id, act_id, name, access_token, status, currency, timezone, last_synced_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name, 
           access_token = EXCLUDED.access_token, 
           status = EXCLUDED.status, 
           last_synced_at = EXCLUDED.last_synced_at`,
        [
          account.id,
          account.userId,
          account.actId,
          account.name,
          account.accessToken,
          account.status,
          account.currency,
          account.timezone,
          account.lastSyncedAt,
        ]
      );
      return account;
    }
    metaAccountsStore.upsert(account);
    return account;
  },

  // CAMPAIGNS METHODS
  async getCampaigns(metaAccountId: string): Promise<Campaign[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM campaigns WHERE meta_account_id = $1', [metaAccountId]);
      return res.rows.map((row) => ({
        id: row.id,
        metaAccountId: row.meta_account_id,
        campaignId: row.campaign_id,
        name: row.name,
        status: row.status,
        objective: row.objective,
        buyingType: row.buying_type,
        budget: Number(row.budget),
        createdTime: row.created_time,
      }));
    }
    return campaignsStore.find((c) => c.metaAccountId === metaAccountId);
  },

  async upsertCampaigns(campaigns: Campaign[]): Promise<void> {
    if (pgPool) {
      for (const c of campaigns) {
        await pgPool.query(
          `INSERT INTO campaigns (id, meta_account_id, campaign_id, name, status, objective, buying_type, budget, created_time) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (id) DO UPDATE SET 
             name = EXCLUDED.name, 
             status = EXCLUDED.status, 
             budget = EXCLUDED.budget`,
          [c.id, c.metaAccountId, c.campaignId, c.name, c.status, c.objective, c.buyingType, c.budget, c.createdTime]
        );
      }
      return;
    }
    campaignsStore.upsertMany(campaigns);
  },

  // ADSETS METHODS
  async getAdsets(campaignIds: string[]): Promise<Adset[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM adsets WHERE campaign_id = ANY($1)', [campaignIds]);
      return res.rows.map((row) => ({
        id: row.id,
        campaignId: row.campaign_id,
        adsetId: row.adset_id,
        name: row.name,
        status: row.status,
        targeting: typeof row.targeting === 'string' ? JSON.parse(row.targeting) : row.targeting,
        budget: Number(row.budget),
      }));
    }
    return adsetsStore.find((a) => campaignIds.includes(a.campaignId));
  },

  async upsertAdsets(adsets: Adset[]): Promise<void> {
    if (pgPool) {
      for (const a of adsets) {
        await pgPool.query(
          `INSERT INTO adsets (id, campaign_id, adset_id, name, status, targeting, budget) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (id) DO UPDATE SET 
             name = EXCLUDED.name, 
             status = EXCLUDED.status, 
             targeting = EXCLUDED.targeting,
             budget = EXCLUDED.budget`,
          [a.id, a.campaignId, a.adsetId, a.name, a.status, JSON.stringify(a.targeting), a.budget]
        );
      }
      return;
    }
    adsetsStore.upsertMany(adsets);
  },

  // ADS METHODS
  async getAds(adsetIds: string[]): Promise<Ad[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM ads WHERE adset_id = ANY($1)', [adsetIds]);
      return res.rows.map((row) => ({
        id: row.id,
        adsetId: row.adset_id,
        adId: row.ad_id,
        name: row.name,
        status: row.status,
        creativeId: row.creative_id,
      }));
    }
    return adsStore.find((a) => adsetIds.includes(a.adsetId));
  },

  async upsertAds(ads: Ad[]): Promise<void> {
    if (pgPool) {
      for (const ad of ads) {
        await pgPool.query(
          `INSERT INTO ads (id, adset_id, ad_id, name, status, creative_id) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (id) DO UPDATE SET 
             name = EXCLUDED.name, 
             status = EXCLUDED.status, 
             creative_id = EXCLUDED.creative_id`,
          [ad.id, ad.adsetId, ad.adId, ad.name, ad.status, ad.creativeId]
        );
      }
      return;
    }
    adsStore.upsertMany(ads);
  },

  // CREATIVES METHODS
  async getCreatives(): Promise<Creative[]> {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM creatives');
      return res.rows.map((row) => ({
        id: row.id,
        creativeId: row.creative_id,
        name: row.name,
        headline: row.headline,
        body: row.body,
        imageUrl: row.image_url,
        videoUrl: row.video_url,
        callToActionType: row.call_to_action_type,
        thumbnailUrl: row.thumbnail_url,
      }));
    }
    return creativesStore.getAll();
  },

  async upsertCreatives(creatives: Creative[]): Promise<void> {
    if (pgPool) {
      for (const cr of creatives) {
        await pgPool.query(
          `INSERT INTO creatives (id, creative_id, name, headline, body, image_url, video_url, call_to_action_type, thumbnail_url) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (id) DO UPDATE SET 
             headline = EXCLUDED.headline, 
             body = EXCLUDED.body, 
             image_url = EXCLUDED.image_url,
             thumbnail_url = EXCLUDED.thumbnail_url`,
          [cr.id, cr.creativeId, cr.name, cr.headline, cr.body, cr.imageUrl, cr.videoUrl, cr.callToActionType, cr.thumbnailUrl]
        );
      }
      return;
    }
    creativesStore.upsertMany(creatives);
  },

  // INSIGHTS DAILY METHODS
  async getDailyInsights(entityType: 'CAMPAIGN' | 'ADSET' | 'AD', entityIds: string[], startDate: string, endDate: string): Promise<DailyInsight[]> {
    if (pgPool) {
      const res = await pgPool.query(
        `SELECT * FROM insights_daily 
         WHERE entity_type = $1 AND entity_id = ANY($2) AND date BETWEEN $3 AND $4
         ORDER BY date ASC`,
        [entityType, entityIds, startDate, endDate]
      );
      return res.rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        date: row.date.toISOString ? row.date.toISOString().split('T')[0] : row.date,
        spend: Number(row.spend),
        impressions: Number(row.impressions),
        clicks: Number(row.clicks),
        purchases: Number(row.purchases),
        revenue: Number(row.revenue),
        ctr: Number(row.ctr),
        cpc: Number(row.cpc),
        cpm: Number(row.cpm),
        roas: Number(row.roas),
        cpa: Number(row.cpa),
        frequency: Number(row.frequency),
        deviceBreakdown: typeof row.device_breakdown === 'string' ? JSON.parse(row.device_breakdown) : row.device_breakdown,
        placementBreakdown: typeof row.placement_breakdown === 'string' ? JSON.parse(row.placement_breakdown) : row.placement_breakdown,
        demographics: typeof row.demographics === 'string' ? JSON.parse(row.demographics) : row.demographics,
      }));
    }
    return dailyInsightsStore.find(
      (di) =>
        di.entityType === entityType &&
        entityIds.includes(di.entityId) &&
        di.date >= startDate &&
        di.date <= endDate
    );
  },

  async upsertDailyInsights(insights: DailyInsight[]): Promise<void> {
    if (pgPool) {
      for (const i of insights) {
        await pgPool.query(
          `INSERT INTO insights_daily 
           (id, entity_type, entity_id, date, spend, impressions, clicks, purchases, revenue, ctr, cpc, cpm, roas, cpa, frequency, device_breakdown, placement_breakdown, demographics) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
           ON CONFLICT (id) DO UPDATE SET 
             spend = EXCLUDED.spend, 
             impressions = EXCLUDED.impressions, 
             clicks = EXCLUDED.clicks,
             purchases = EXCLUDED.purchases,
             revenue = EXCLUDED.revenue,
             ctr = EXCLUDED.ctr,
             cpc = EXCLUDED.cpc,
             cpm = EXCLUDED.cpm,
             roas = EXCLUDED.roas,
             cpa = EXCLUDED.cpa,
             frequency = EXCLUDED.frequency`,
          [
            i.id,
            i.entityType,
            i.entityId,
            i.date,
            i.spend,
            i.impressions,
            i.clicks,
            i.purchases,
            i.revenue,
            i.ctr,
            i.cpc,
            i.cpm,
            i.roas,
            i.cpa,
            i.frequency,
            JSON.stringify(i.deviceBreakdown || {}),
            JSON.stringify(i.placementBreakdown || {}),
            JSON.stringify(i.demographics || {}),
          ]
        );
      }
      return;
    }
    dailyInsightsStore.upsertMany(insights);
  },

  // INSIGHTS HOURLY METHODS
  async getHourlyInsights(entityType: 'CAMPAIGN' | 'ADSET' | 'AD', entityIds: string[], startDate: string, endDate: string): Promise<HourlyInsight[]> {
    if (pgPool) {
      const res = await pgPool.query(
        `SELECT * FROM insights_hourly 
         WHERE entity_type = $1 AND entity_id = ANY($2) AND timestamp BETWEEN $3 AND $4
         ORDER BY timestamp ASC`,
        [entityType, entityIds, startDate, endDate]
      );
      return res.rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        timestamp: row.timestamp,
        spend: Number(row.spend),
        impressions: Number(row.impressions),
        clicks: Number(row.clicks),
        purchases: Number(row.purchases),
        revenue: Number(row.revenue),
        ctr: Number(row.ctr),
        cpc: Number(row.cpc),
        cpm: Number(row.cpm),
        roas: Number(row.roas),
        cpa: Number(row.cpa),
      }));
    }
    // Simple filter: extract date from hourly timestamp 'YYYY-MM-DDTHH:MM:SS'
    return hourlyInsightsStore.find(
      (hi) => {
        const hDate = hi.timestamp.split('T')[0];
        return hi.entityType === entityType &&
          entityIds.includes(hi.entityId) &&
          hDate >= startDate &&
          hDate <= endDate;
      }
    );
  },

  async upsertHourlyInsights(insights: HourlyInsight[]): Promise<void> {
    if (pgPool) {
      for (const i of insights) {
        await pgPool.query(
          `INSERT INTO insights_hourly 
           (id, entity_type, entity_id, timestamp, spend, impressions, clicks, purchases, revenue, ctr, cpc, cpm, roas, cpa) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
           ON CONFLICT (id) DO UPDATE SET 
             spend = EXCLUDED.spend, 
             impressions = EXCLUDED.impressions, 
             clicks = EXCLUDED.clicks,
             purchases = EXCLUDED.purchases,
             revenue = EXCLUDED.revenue,
             ctr = EXCLUDED.ctr,
             cpc = EXCLUDED.cpc,
             cpm = EXCLUDED.cpm,
             roas = EXCLUDED.roas,
             cpa = EXCLUDED.cpa`,
          [i.id, i.entityType, i.entityId, i.timestamp, i.spend, i.impressions, i.clicks, i.purchases, i.revenue, i.ctr, i.cpc, i.cpm, i.roas, i.cpa]
        );
      }
      return;
    }
    hourlyInsightsStore.upsertMany(insights);
  },
};
