import { db } from '../db';
import { organizations } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Custom error for Meta permission issues.
 */
export class MetaPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MetaPermissionError';
  }
}

interface MetaGraphAction {
  action_type: string;
  value: string;
}

interface MetaGraphRow {
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaGraphAction[];
  action_values?: MetaGraphAction[];
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  date_start?: string;
}

export class MetaService {
  static async getToken(organizationId: string): Promise<string | null> {
    const orgs = await db.select({ metaAccessToken: organizations.metaAccessToken })
      .from(organizations)
      .where(eq(organizations.id, organizationId));
    
    if (orgs.length === 0) return null;
    return orgs[0].metaAccessToken;
  }

  static async fetchGraph(organizationId: string, accountId: string, endpoint: string, params: Record<string, unknown> = {}) {
    const token = await this.getToken(organizationId);
    if (!token) throw new Error('No Meta access token found for this organization');
    
    const actId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const url = new URL(`https://graph.facebook.com/v19.0/${actId}/${endpoint}`);
    
    url.searchParams.append('access_token', token);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, String(value));
    });

    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.error) {
      // Detect permission error (code 200) and provide a clearer message
      if (json.error.code === 200) {
        throw new MetaPermissionError('Missing ads_management or ads_read permission.');
      }
      throw new Error(json.error.message);
    }
    return json;
  }

  static async getOverview(organizationId: string, accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(organizationId, accountId, 'insights', {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'spend,impressions,clicks,inline_link_clicks,actions,action_values,cpc,cpm,ctr',
      level: 'account'
    });

    if (!data.data || data.data.length === 0) {
      return { spend: 0, revenue: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0, roas: 0, costPerConversion: 0, cpc: 0, cpm: 0, cpa: 0, purchases: 0, frequency: 0 };
    }

    const row = data.data[0];
    const spend = parseFloat(row.spend || '0');
    const impressions = parseInt(row.impressions || '0');
    const clicks = parseInt(row.clicks || '0');
    const ctr = parseFloat(row.ctr || '0');
    const cpc = parseFloat(row.cpc || '0');
    const cpm = parseFloat(row.cpm || '0');
    
    const purchasesAction = (row.actions || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
    const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0;
    
    const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
    const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;
    
    const roas = spend > 0 ? (revenue / spend) : 0;
    const cpa = purchases > 0 ? (spend / purchases) : 0;

    return {
      spend, revenue, impressions, clicks, ctr, conversions: purchases,
      roas, costPerConversion: cpa, cpc, cpm, cpa, purchases, frequency: 1.0
    };
  }

  static async getCampaigns(organizationId: string, accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(organizationId, accountId, 'insights', {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'campaign_id,campaign_name,spend,actions,action_values',
      level: 'campaign',
      limit: 50
    });

    const list = (data.data || []).map((row: MetaGraphRow) => {
      const spend = parseFloat(row.spend || '0');
      const purchasesAction = (row.actions || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0;
      const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;
      const roas = spend > 0 ? (revenue / spend) : 0;
      const cpa = purchases > 0 ? (spend / purchases) : 0;

      return {
        id: row.campaign_id, name: row.campaign_name, status: 'ACTIVE',
        spend, roas, conversions: purchases, purchases, cpa
      };
    });

    return { list, total: list.length };
  }

  static async getAdsets(organizationId: string, accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(organizationId, accountId, 'insights', {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'adset_id,adset_name,spend,actions,action_values',
      level: 'adset',
      limit: 20
    });

    return (data.data || []).map((row: MetaGraphRow) => {
      const spend = parseFloat(row.spend || '0');
      const purchasesAction = (row.actions || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0;
      const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;

      return {
        id: row.adset_id, name: row.adset_name, status: 'ACTIVE',
        spend, roas: spend > 0 ? (revenue / spend) : 0, conversions: purchases
      };
    });
  }

  static async getCharts(organizationId: string, accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(organizationId, accountId, 'insights', {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'date_start,spend,actions,action_values,ctr',
      time_increment: 1,
      level: 'account'
    });

    return (data.data || []).map((row: MetaGraphRow) => {
      const spend = parseFloat(row.spend || '0');
      const ctr = parseFloat(row.ctr || '0');
      const purchasesAction = (row.actions || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0;
      const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;

      return {
        date: row.date_start, spend, roas: spend > 0 ? (revenue / spend) : 0, ctr, purchases
      };
    });
  }

  static async getCreatives(organizationId: string, accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(organizationId, accountId, 'insights', {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: 'ad_id,ad_name,spend,ctr,actions,action_values',
      level: 'ad',
      limit: 20
    });

    return (data.data || []).map((row: MetaGraphRow) => {
      const spend = parseFloat(row.spend || '0');
      const ctr = parseFloat(row.ctr || '0');
      const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
      const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;

      return {
        id: row.ad_id, name: row.ad_name, format: 'image',
        spend, ctr, roas: spend > 0 ? (revenue / spend) : 0, fatigueScore: 0, frequency: 1
      };
    });
  }

  static async getBreakdowns(_organizationId: string, _accountId: string, _startDate: string, _endDate: string) {
    return {
      demographics: [],
      devices: [],
      placements: []
    };
  }

  static async getRecommendations(_organizationId: string, _accountId: string) {
    return [];
  }
}
