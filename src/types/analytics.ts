// src/types/analytics.ts
// Shared normalized types for frontend Vero dashboard elements.
// Isolates UI from database-specific response schemas (Appwrite, Meta API, etc.)

export interface Campaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  roas: number;
  conversions: number;
  purchases: number;
  cpa: number;
}

export interface Creative {
  id: string;
  name: string;
  format: string;
  spend: number;
  ctr: number;
  roas: number;
  fatigueScore: number;
  frequency: number;
}

export interface Insight {
  id: string;
  date: string;
  spend: number;
  roas: number;
  ctr: number;
  purchases: number;
  impressions?: number;
  clicks?: number;
  revenue?: number;
  cpc?: number;
  cpm?: number;
}

export interface AnalyticsOverview {
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  roas: number;
  costPerConversion: number;
  cpc: number;
  cpm: number;
  cpa: number;
  purchases: number;
  frequency: number;
}

export interface AIRecommendation {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  impact: string;
}
