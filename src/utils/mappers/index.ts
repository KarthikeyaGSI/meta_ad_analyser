// src/utils/mappers/index.ts
// Standardized adapters/mappers to normalize and sanitize different raw data structures
// (Appwrite collection documents, demoData fallbacks, direct Meta API responses)
// into one consistent frontend dashboard shape.

import { Campaign, Creative, Insight, AnalyticsOverview, AIRecommendation } from '../../types/analytics';

/**
 * Strips Appwrite system fields ($id, $createdAt, etc.) and maps document properties
 * into a clean, normalized Campaign shape.
 */
export function mapCampaignDocument(doc: any): Campaign {
  if (!doc) {
    return {
      id: '',
      name: 'Unknown Campaign',
      status: 'PAUSED',
      spend: 0,
      roas: 0,
      conversions: 0,
      purchases: 0,
      cpa: 0
    };
  }

  // Handle various id formats (Meta id, Appwrite campaignId, local storage id)
  const id = doc.campaignId || doc.id || doc.$id || '';
  const name = doc.name || 'Unnamed Campaign';
  const status = String(doc.status || 'ACTIVE').toUpperCase();
  const spend = Number(doc.spend ?? 0);
  const roas = Number(doc.roas ?? 0);
  const purchases = Number(doc.purchases ?? doc.conversions ?? 0);
  const conversions = purchases;
  const cpa = Number(doc.cpa ?? (purchases > 0 ? spend / purchases : 0));

  return {
    id,
    name,
    status,
    spend,
    roas,
    conversions,
    purchases,
    cpa
  };
}

/**
 * Normalizes Ad Creative structures into a clean frontend representation.
 */
export function mapCreativeDocument(doc: any): Creative {
  if (!doc) {
    return {
      id: '',
      name: 'Unknown Creative',
      format: 'image',
      spend: 0,
      ctr: 0,
      roas: 0,
      fatigueScore: 0,
      frequency: 1
    };
  }

  const id = doc.creativeId || doc.id || doc.$id || '';
  const name = doc.name || 'Unnamed Creative';
  const format = String(doc.format || 'image').toLowerCase();
  const spend = Number(doc.spend ?? 0);
  const ctr = Number(doc.ctr ?? 0);
  const roas = Number(doc.roas ?? 0);
  const fatigueScore = Number(doc.fatigueScore ?? 0);
  const frequency = Number(doc.frequency ?? 1);

  return {
    id,
    name,
    format,
    spend,
    ctr,
    roas,
    fatigueScore,
    frequency
  };
}

/**
 * Normalizes Daily/Hourly insight records into a clean graph-ready format.
 */
export function mapInsightDocument(doc: any): Insight {
  if (!doc) {
    return {
      id: '',
      date: '',
      spend: 0,
      roas: 0,
      ctr: 0,
      purchases: 0
    };
  }

  const id = doc.entityId || doc.id || doc.$id || '';
  const date = doc.date || doc.date_start || doc.timestamp || '';
  const spend = Number(doc.spend ?? 0);
  const roas = Number(doc.roas ?? 0);
  const ctr = Number(doc.ctr ?? 0);
  const purchases = Number(doc.purchases ?? doc.conversions ?? 0);

  const result: Insight = {
    id,
    date,
    spend,
    roas,
    ctr,
    purchases
  };

  if ('impressions' in doc) result.impressions = Number(doc.impressions);
  if ('clicks' in doc) result.clicks = Number(doc.clicks);
  if ('revenue' in doc) result.revenue = Number(doc.revenue);
  if ('cpc' in doc) result.cpc = Number(doc.cpc);
  if ('cpm' in doc) result.cpm = Number(doc.cpm);

  return result;
}

/**
 * Normalizes High-Level Analytics KPIs to prevent UI breakdown.
 */
export function mapAnalyticsOverview(doc: any): AnalyticsOverview {
  if (!doc) {
    return {
      spend: 0,
      revenue: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversions: 0,
      roas: 0,
      costPerConversion: 0,
      cpc: 0,
      cpm: 0,
      cpa: 0,
      purchases: 0,
      frequency: 1
    };
  }

  const spend = Number(doc.spend ?? 0);
  const revenue = Number(doc.revenue ?? 0);
  const impressions = Number(doc.impressions ?? 0);
  const clicks = Number(doc.clicks ?? 0);
  const ctr = Number(doc.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : 0));
  const purchases = Number(doc.purchases ?? doc.conversions ?? 0);
  const conversions = purchases;
  const roas = Number(doc.roas ?? (spend > 0 ? revenue / spend : 0));
  const cpa = Number(doc.cpa ?? doc.costPerConversion ?? (purchases > 0 ? spend / purchases : 0));
  const costPerConversion = cpa;
  const cpc = Number(doc.cpc ?? (clicks > 0 ? spend / clicks : 0));
  const cpm = Number(doc.cpm ?? (impressions > 0 ? (spend / impressions) * 1000 : 0));
  const frequency = Number(doc.frequency ?? 1);

  return {
    spend,
    revenue,
    impressions,
    clicks,
    ctr,
    conversions,
    roas,
    costPerConversion,
    cpc,
    cpm,
    cpa,
    purchases,
    frequency
  };
}

/**
 * Normalizes AI recommendations format.
 */
export function mapAIRecommendation(doc: any): AIRecommendation {
  if (!doc) {
    return {
      id: '',
      type: 'general',
      priority: 'low',
      title: 'Performance check',
      description: 'Review your general analytics dashboard.',
      impact: 'Informational'
    };
  }

  return {
    id: doc.id || doc.$id || '',
    type: doc.type || 'general',
    priority: doc.priority || 'medium',
    title: doc.title || 'Insight Recommendation',
    description: doc.description || '',
    impact: doc.impact || 'N/A'
  };
}
