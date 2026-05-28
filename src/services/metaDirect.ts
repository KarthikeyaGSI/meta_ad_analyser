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

export class MetaDirectApi {
  static getToken(accountId: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`meta_token_${accountId}`);
  }

  static async fetchGraph(accountId: string, endpoint: string, params: Record<string, unknown> = {}) {
    const token = this.getToken(accountId);
    if (!token) throw new Error('No direct token found');
    
    const actId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const url = new URL(`https://graph.facebook.com/v19.0/${actId}/${endpoint}`);
    
    url.searchParams.append('access_token', token);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, String(value));
    });

    const res = await fetch(url.toString());
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json;
  }

  static async getOverview(accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(accountId, 'insights', {
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
    
    // Parse purchases from actions
    const purchasesAction = (row.actions || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
    const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0;
    
    const revenueAction = (row.action_values || []).find((a: MetaGraphAction) => a.action_type === 'purchase');
    const revenue = revenueAction ? parseFloat(revenueAction.value) : 0;
    
    const roas = spend > 0 ? (revenue / spend) : 0;
    const cpa = purchases > 0 ? (spend / purchases) : 0;

    return {
      spend,
      revenue,
      impressions,
      clicks,
      ctr,
      conversions: purchases,
      roas,
      costPerConversion: cpa,
      cpc,
      cpm,
      cpa,
      purchases,
      frequency: 1.0 // Graph API requires reach for frequency, which is complex, defaulting to 1
    };
  }

  static async getCampaigns(accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(accountId, 'insights', {
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
        id: row.campaign_id,
        name: row.campaign_name,
        status: 'ACTIVE',
        spend,
        roas,
        conversions: purchases,
        purchases,
        cpa
      };
    });

    return { list, total: list.length };
  }

  static async getAdsets(accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(accountId, 'insights', {
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
        id: row.adset_id,
        name: row.adset_name,
        status: 'ACTIVE',
        spend,
        roas: spend > 0 ? (revenue / spend) : 0,
        conversions: purchases
      };
    });
  }

  static async getCharts(accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(accountId, 'insights', {
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
        date: row.date_start,
        spend,
        roas: spend > 0 ? (revenue / spend) : 0,
        ctr,
        purchases
      };
    });
  }

  static async getCreatives(accountId: string, startDate: string, endDate: string) {
    const data = await this.fetchGraph(accountId, 'insights', {
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
        id: row.ad_id,
        name: row.ad_name,
        format: 'image', // Graph API requires ad metadata for real format, stubbing
        spend,
        ctr,
        roas: spend > 0 ? (revenue / spend) : 0,
        fatigueScore: 0,
        frequency: 1
      };
    });
  }

  static async getBreakdowns(_accountId: string, _startDate: string, _endDate: string) {
    // We would ideally fetch demographics and device breakdowns here, 
    // but they require separate queries. For a quick sync implementation:
    return {
      demographics: [],
      devices: [],
      placements: []
    };
  }

  static async getRecommendations(_accountId: string) {
    // Recommendations require AI running on data, fallback to empty
    return [];
  }
}
