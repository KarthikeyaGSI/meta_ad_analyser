// backend/src/database/dbClient.ts
import path from 'path';
import fs from 'fs';
import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ---------------------------------------------------------------------------
// Types (unchanged)
// ---------------------------------------------------------------------------
export interface User { id: string; email: string; passwordHash: string; name: string; createdAt: string; updatedAt: string; }
export interface MetaAccount { id: string; userId: string; actId: string; name: string; accessToken: string; status: string; currency: string; timezone: string; lastSyncedAt: string; }
export interface Campaign { id: string; metaAccountId: string; campaignId: string; name: string; status: string; objective: string; buyingType: string; budget: number; createdTime: string; }
export interface Adset { id: string; campaignId: string; adsetId: string; name: string; status: string; targeting: any; budget: number; }
export interface Ad { id: string; adsetId: string; adId: string; name: string; status: string; creativeId: string; }
export interface Creative { id: string; creativeId: string; name: string; headline: string; body: string; imageUrl: string; videoUrl?: string; callToActionType: string; thumbnailUrl: string; }
export interface DailyInsight { id: string; entityType: 'CAMPAIGN' | 'ADSET' | 'AD'; entityId: string; date: string; spend: number; impressions: number; clicks: number; purchases: number; revenue: number; ctr: number; cpc: number; cpm: number; roas: number; cpa: number; frequency: number; deviceBreakdown?: any; placementBreakdown?: any; demographics?: any; }
export interface HourlyInsight { id: string; entityType: 'CAMPAIGN' | 'ADSET' | 'AD'; entityId: string; timestamp: string; spend: number; impressions: number; clicks: number; purchases: number; revenue: number; ctr: number; cpc: number; cpm: number; roas: number; cpa: number; }
export interface SyncSession { id: string; metaAccountId: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'; rowsProcessed: number; durationMs: number; errorMessage?: string; createdAt: string; }

// ---------------------------------------------------------------------------
// Appwrite client (optional)
// ---------------------------------------------------------------------------
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';
const API_KEY = process.env.APPWRITE_API_KEY;

let appwriteDb: Databases | null = null;
if (API_KEY && PROJECT_ID && DATABASE_ID) {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  appwriteDb = new Databases(client);
  console.log('[Vero DB] Appwrite client configured.');
} else {
  console.log('[Vero DB] Appwrite credentials missing – falling back to local JSON DB.');
}

// ---------------------------------------------------------------------------
// Local JSON fallback – used only when Appwrite is not configured
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) { fs.mkdirSync(DATA_DIR, { recursive: true }); }
class LocalTableStore<T extends { id: string }> {
  private filePath: string;
  constructor(tableName: string) { this.filePath = path.join(DATA_DIR, `${tableName}.json`); if (!fs.existsSync(this.filePath)) { this.save([]); } }
  getAll(): T[] { try { const content = fs.readFileSync(this.filePath, 'utf-8'); return JSON.parse(content || '[]'); } catch { return []; } }
  save(data: T[]): void { fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8'); }
  upsert(item: T): void { const list = this.getAll(); const idx = list.findIndex(x => x.id === item.id); if (idx > -1) list[idx] = { ...list[idx], ...item }; else list.push(item); this.save(list); }
  upsertMany(items: T[]): void { const list = this.getAll(); for (const item of items) { const idx = list.findIndex(x => x.id === item.id); if (idx > -1) list[idx] = { ...list[idx], ...item }; else list.push(item); } this.save(list); }
  find(predicate: (item: T) => boolean): T[] { return this.getAll().filter(predicate); }
  findOne(predicate: (item: T) => boolean): T | undefined { return this.getAll().find(predicate); }
}
const usersStore = new LocalTableStore<User>('users');
const metaAccountsStore = new LocalTableStore<MetaAccount>('meta_accounts');
const campaignsStore = new LocalTableStore<Campaign>('campaigns');
const adsetsStore = new LocalTableStore<Adset>('adsets');
const adsStore = new LocalTableStore<Ad>('ads');
const creativesStore = new LocalTableStore<Creative>('creatives');
const dailyInsightsStore = new LocalTableStore<DailyInsight>('insights_daily');
const hourlyInsightsStore = new LocalTableStore<HourlyInsight>('insights_hourly');
const syncSessionsStore = new LocalTableStore<SyncSession>('sync_sessions');

// ---------------------------------------------------------------------------
// Helper – Appwrite wrapper (returns undefined on error)
// ---------------------------------------------------------------------------
async function safeAppwrite<T>(promise: Promise<T>): Promise<T | undefined> {
  try { return await promise; } catch (e) { console.error('[Vero DB] Appwrite error:', e); return undefined; }
}

// ---------------------------------------------------------------------------
// DATABASE SERVICE INTERFACE (Appwrite first, fallback to local JSON)
// ---------------------------------------------------------------------------
export const db = {
  // SYNC SESSION METHODS
  async getSyncSessions(metaAccountId: string): Promise<SyncSession[]> {
    if (appwriteDb) {
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'sync_logs', [`metaAccountId=${metaAccountId}`, 'order=createdAt desc', 'limit=10']));
      return docs?.documents.map(d => ({
        id: d.$id,
        metaAccountId: d.metaAccountId,
        status: d.status,
        rowsProcessed: Number(d.rowsProcessed),
        durationMs: Number(d.durationMs),
        errorMessage: d.errorMessage,
        createdAt: d.createdAt,
      })) ?? [];
    }
    return syncSessionsStore.find(s => s.metaAccountId === metaAccountId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,10);
  },
  async upsertSyncSession(session: SyncSession): Promise<void> {
    if (appwriteDb) {
      await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'sync_logs', ID.unique(), {
        metaAccountId: session.metaAccountId,
        status: session.status,
        rowsProcessed: session.rowsProcessed,
        durationMs: session.durationMs,
        errorMessage: session.errorMessage ?? null,
        createdAt: session.createdAt,
      }));
      return;
    }
    syncSessionsStore.upsert(session);
  },
  async createSyncLog(entry: { metaAccountId: string; status: string; rowsProcessed: number; durationMs?: number; errorMessage?: string; createdAt?: string; }): Promise<void> {
    const log = { id: `sync_${Date.now()}`, metaAccountId: entry.metaAccountId, status: entry.status, rowsProcessed: entry.rowsProcessed, durationMs: entry.durationMs ?? 0, errorMessage: entry.errorMessage, createdAt: entry.createdAt ?? new Date().toISOString() };
    await this.upsertSyncSession(log as any);
  },
  // USER METHODS
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (appwriteDb) {
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'users', [`email=${email}`]));
      if (docs && docs.documents.length) {
        const d = docs.documents[0];
        return { id: d.$id, email: d.email, passwordHash: d.passwordHash, name: d.name, createdAt: d.createdAt, updatedAt: d.updatedAt };
      }
      return undefined;
    }
    return usersStore.findOne(u => u.email.toLowerCase() === email.toLowerCase());
  },
  async createUser(user: User): Promise<User> {
    if (appwriteDb) {
      await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'users', user.id, {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      return user;
    }
    usersStore.upsert(user);
    return user;
  },
  // ACCOUNT METHODS
  async getAccountsByUserId(userId: string): Promise<MetaAccount[]> {
    if (appwriteDb) {
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'meta_accounts', [`userId=${userId}`]));
      return docs?.documents.map(d => ({ id: d.$id, userId: d.userId, actId: d.actId, name: d.name, accessToken: d.accessToken, status: d.status, currency: d.currency, timezone: d.timezone, lastSyncedAt: d.lastSyncedAt })) ?? [];
    }
    return metaAccountsStore.find(a => a.userId === userId);
  },
  async getAccountById(accountId: string): Promise<MetaAccount | undefined> {
    if (appwriteDb) {
      const doc = await safeAppwrite(appwriteDb.getDocument(DATABASE_ID, 'meta_accounts', accountId));
      if (doc) {
        return { id: doc.$id, userId: doc.userId, actId: doc.actId, name: doc.name, accessToken: doc.accessToken, status: doc.status, currency: doc.currency, timezone: doc.timezone, lastSyncedAt: doc.lastSyncedAt };
      }
      return undefined;
    }
    return metaAccountsStore.findOne(a => a.id === accountId);
  },
  async upsertMetaAccount(account: MetaAccount): Promise<MetaAccount> {
    if (appwriteDb) {
      await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'meta_accounts', account.id, {
        userId: account.userId,
        actId: account.actId,
        name: account.name,
        accessToken: account.accessToken,
        status: account.status,
        currency: account.currency,
        timezone: account.timezone,
        lastSyncedAt: account.lastSyncedAt,
      }));
      return account;
    }
    metaAccountsStore.upsert(account);
    return account;
  },
  // CAMPAIGN METHODS
  async getCampaigns(metaAccountId: string): Promise<Campaign[]> {
    if (appwriteDb) {
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'campaigns', [`metaAccountId=${metaAccountId}`]));
      return docs?.documents.map(d => ({ id: d.$id, metaAccountId: d.metaAccountId, campaignId: d.campaignId, name: d.name, status: d.status, objective: d.objective, buyingType: d.buyingType, budget: Number(d.budget), createdTime: d.createdTime })) ?? [];
    }
    return campaignsStore.find(c => c.metaAccountId === metaAccountId);
  },
  async upsertCampaigns(campaigns: Campaign[]): Promise<void> {
    if (appwriteDb) {
      for (const c of campaigns) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'campaigns', c.id, {
          metaAccountId: c.metaAccountId,
          campaignId: c.campaignId,
          name: c.name,
          status: c.status,
          objective: c.objective,
          buyingType: c.buyingType,
          budget: c.budget,
          createdTime: c.createdTime,
        }));
      }
      return;
    }
    campaignsStore.upsertMany(campaigns);
  },
  // ADSET METHODS
  async getAdsets(campaignIds: string[]): Promise<Adset[]> {
    if (appwriteDb) {
      const filter = campaignIds.map(id => `campaignId=${id}`).join(' && ');
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'adsets', [filter]));
      return docs?.documents.map(d => ({ id: d.$id, campaignId: d.campaignId, adsetId: d.adsetId, name: d.name, status: d.status, targeting: typeof d.targeting === 'string' ? JSON.parse(d.targeting) : d.targeting, budget: Number(d.budget) })) ?? [];
    }
    return adsetsStore.find(a => campaignIds.includes(a.campaignId));
  },
  async upsertAdsets(adsets: Adset[]): Promise<void> {
    if (appwriteDb) {
      for (const a of adsets) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'adsets', a.id, {
          campaignId: a.campaignId,
          adsetId: a.adsetId,
          name: a.name,
          status: a.status,
          targeting: JSON.stringify(a.targeting),
          budget: a.budget,
        }));
      }
      return;
    }
    adsetsStore.upsertMany(adsets);
  },
  // AD METHODS
  async getAds(adsetIds: string[]): Promise<Ad[]> {
    if (appwriteDb) {
      const filter = adsetIds.map(id => `adsetId=${id}`).join(' && ');
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'ads', [filter]));
      return docs?.documents.map(d => ({ id: d.$id, adsetId: d.adsetId, adId: d.adId, name: d.name, status: d.status, creativeId: d.creativeId })) ?? [];
    }
    return adsStore.find(a => adsetIds.includes(a.adsetId));
  },
  async upsertAds(ads: Ad[]): Promise<void> {
    if (appwriteDb) {
      for (const ad of ads) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'ads', ad.id, {
          adsetId: ad.adsetId,
          adId: ad.adId,
          name: ad.name,
          status: ad.status,
          creativeId: ad.creativeId,
        }));
      }
      return;
    }
    adsStore.upsertMany(ads);
  },
  // CREATIVE METHODS
  async getCreatives(): Promise<Creative[]> {
    if (appwriteDb) {
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'creatives'));
      return docs?.documents.map(d => ({ id: d.$id, creativeId: d.creativeId, name: d.name, headline: d.headline, body: d.body, imageUrl: d.imageUrl, videoUrl: d.videoUrl, callToActionType: d.callToActionType, thumbnailUrl: d.thumbnailUrl })) ?? [];
    }
    return creativesStore.getAll();
  },
  async upsertCreatives(creatives: Creative[]): Promise<void> {
    if (appwriteDb) {
      for (const cr of creatives) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'creatives', cr.id, {
          creativeId: cr.creativeId,
          name: cr.name,
          headline: cr.headline,
          body: cr.body,
          imageUrl: cr.imageUrl,
          videoUrl: cr.videoUrl,
          callToActionType: cr.callToActionType,
          thumbnailUrl: cr.thumbnailUrl,
        }));
      }
      return;
    }
    creativesStore.upsertMany(creatives);
  },
  // DAILY INSIGHTS
  async getDailyInsights(entityType: 'CAMPAIGN' | 'ADSET' | 'AD', entityIds: string[], startDate: string, endDate: string): Promise<DailyInsight[]> {
    if (appwriteDb) {
      const filter = `entityType=${entityType} && entityId=${entityIds.join(',')} && date>=${startDate} && date<=${endDate}`;
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'insights_daily', [filter]));
      return docs?.documents.map(d => ({
        id: d.$id,
        entityType: d.entityType,
        entityId: d.entityId,
        date: d.date,
        spend: Number(d.spend),
        impressions: Number(d.impressions),
        clicks: Number(d.clicks),
        purchases: Number(d.purchases),
        revenue: Number(d.revenue),
        ctr: Number(d.ctr),
        cpc: Number(d.cpc),
        cpm: Number(d.cpm),
        roas: Number(d.roas),
        cpa: Number(d.cpa),
        frequency: Number(d.frequency),
        deviceBreakdown: typeof d.deviceBreakdown === 'string' ? JSON.parse(d.deviceBreakdown) : d.deviceBreakdown,
        placementBreakdown: typeof d.placementBreakdown === 'string' ? JSON.parse(d.placementBreakdown) : d.placementBreakdown,
        demographics: typeof d.demographics === 'string' ? JSON.parse(d.demographics) : d.demographics,
      })) ?? [];
    }
    return dailyInsightsStore.find(di => di.entityType === entityType && entityIds.includes(di.entityId) && di.date >= startDate && di.date <= endDate);
  },
  async upsertDailyInsights(insights: DailyInsight[]): Promise<void> {
    if (appwriteDb) {
      for (const i of insights) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'insights_daily', i.id, {
          entityType: i.entityType,
          entityId: i.entityId,
          date: i.date,
          spend: i.spend,
          impressions: i.impressions,
          clicks: i.clicks,
          purchases: i.purchases,
          revenue: i.revenue,
          ctr: i.ctr,
          cpc: i.cpc,
          cpm: i.cpm,
          roas: i.roas,
          cpa: i.cpa,
          frequency: i.frequency,
          deviceBreakdown: JSON.stringify(i.deviceBreakdown || {}),
          placementBreakdown: JSON.stringify(i.placementBreakdown || {}),
          demographics: JSON.stringify(i.demographics || {}),
        }));
      }
      return;
    }
    dailyInsightsStore.upsertMany(insights);
  },
  // HOURLY INSIGHTS
  async getHourlyInsights(entityType: 'CAMPAIGN' | 'ADSET' | 'AD', entityIds: string[], startDate: string, endDate: string): Promise<HourlyInsight[]> {
    if (appwriteDb) {
      const filter = `entityType=${entityType} && entityId=${entityIds.join(',')} && timestamp>=${startDate} && timestamp<=${endDate}`;
      const docs = await safeAppwrite(appwriteDb.listDocuments(DATABASE_ID, 'insights_hourly', [filter]));
      return docs?.documents.map(d => ({
        id: d.$id,
        entityType: d.entityType,
        entityId: d.entityId,
        timestamp: d.timestamp,
        spend: Number(d.spend),
        impressions: Number(d.impressions),
        clicks: Number(d.clicks),
        purchases: Number(d.purchases),
        revenue: Number(d.revenue),
        ctr: Number(d.ctr),
        cpc: Number(d.cpc),
        cpm: Number(d.cpm),
        roas: Number(d.roas),
        cpa: Number(d.cpa),
      })) ?? [];
    }
    return hourlyInsightsStore.find(hi => {
      const hDate = hi.timestamp.split('T')[0];
      return hi.entityType === entityType && entityIds.includes(hi.entityId) && hDate >= startDate && hDate <= endDate;
    });
  },
  async upsertHourlyInsights(insights: HourlyInsight[]): Promise<void> {
    if (appwriteDb) {
      for (const i of insights) {
        await safeAppwrite(appwriteDb.createDocument(DATABASE_ID, 'insights_hourly', i.id, {
          entityType: i.entityType,
          entityId: i.entityId,
          timestamp: i.timestamp,
          spend: i.spend,
          impressions: i.impressions,
          clicks: i.clicks,
          purchases: i.purchases,
          revenue: i.revenue,
          ctr: i.ctr,
          cpc: i.cpc,
          cpm: i.cpm,
          roas: i.roas,
          cpa: i.cpa,
        }));
      }
      return;
    }
    hourlyInsightsStore.upsertMany(insights);
  },
};
