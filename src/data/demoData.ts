// src/data/demoData.ts

export const demoAccounts = [
  { id: 'act_1001', name: 'Sandbox Account A', platform: 'meta', status: 'ACTIVE' }
];

export const demoOverview = {
  spend: 14500.50,
  revenue: 40601.40,
  impressions: 1250000,
  clicks: 45000,
  ctr: 3.6,
  conversions: 850,
  roas: 2.8,
  costPerConversion: 17.05,
  cpc: 0.32,
  cpm: 11.60,
  cpa: 17.05,
  purchases: 850,
  frequency: 1.15,
};

export const demoCharts = [
  { date: '2026-05-01', spend: 400, roas: 1.8, ctr: 2.1, purchases: 12 },
  { date: '2026-05-02', spend: 450, roas: 2.1, ctr: 2.4, purchases: 15 },
  { date: '2026-05-03', spend: 420, roas: 2.0, ctr: 2.2, purchases: 14 },
  { date: '2026-05-04', spend: 500, roas: 2.5, ctr: 3.1, purchases: 22 },
  { date: '2026-05-05', spend: 480, roas: 2.8, ctr: 3.5, purchases: 25 },
  { date: '2026-05-06', spend: 550, roas: 3.1, ctr: 3.8, purchases: 31 },
  { date: '2026-05-07', spend: 600, roas: 3.6, ctr: 4.2, purchases: 45 },
];

export const demoCampaigns = {
  list: [
    { id: 'camp_1', name: 'Summer Sale 2026', status: 'ACTIVE', spend: 5000, roas: 3.2, conversions: 350, purchases: 350, cpa: 14.28 },
    { id: 'camp_2', name: 'Retargeting Top Funnel', status: 'PAUSED', spend: 1200, roas: 1.8, conversions: 45, purchases: 45, cpa: 26.66 },
    { id: 'camp_3', name: 'New Product Launch', status: 'ACTIVE', spend: 8300, roas: 2.5, conversions: 455, purchases: 455, cpa: 18.24 },
  ],
  total: 3
};

export const demoAdsets = [
  { id: 'adset_1', name: 'Lookalike Audience 1%', status: 'ACTIVE', spend: 2000, roas: 3.5, conversions: 150 },
  { id: 'adset_2', name: 'Broad Audience', status: 'ACTIVE', spend: 3000, roas: 2.1, conversions: 200 },
];

export const demoCreatives = [
  { id: 'crt_1', name: 'Video Ad - Product Showcase', format: 'video', spend: 1500, ctr: 4.5, roas: 3.8, fatigueScore: 12, frequency: 1.2 },
  { id: 'crt_2', name: 'Carousel - Best Sellers', format: 'carousel', spend: 1200, ctr: 3.2, roas: 2.4, fatigueScore: 45, frequency: 3.4 },
  { id: 'crt_3', name: 'Static Image - Discount', format: 'image', spend: 2300, ctr: 2.8, roas: 1.9, fatigueScore: 88, frequency: 5.6 },
];

export const demoBreakdowns = {
  demographics: [
    { age: '18-24', spend: 1200, purchases: 80 },
    { age: '25-34', spend: 4500, purchases: 320 },
    { age: '35-44', spend: 5800, purchases: 350 },
    { age: '45-54', spend: 3000, purchases: 100 },
  ],
  devices: [
    { name: 'IOS', percentage: 45, spend: 5616.22 },
    { name: 'ANDROID', percentage: 35, spend: 4368.17 },
    { name: 'DESKTOP', percentage: 20, spend: 2496.11 }
  ],
  placements: [
    { name: 'Instagram Reels', percentage: 40, spend: 4992.20 },
    { name: 'Facebook Feed', percentage: 35, spend: 4368.17 },
    { name: 'Instagram Stories', percentage: 15, spend: 1872.07 },
    { name: 'Audience Network', percentage: 10, spend: 1248.05 }
  ]
};

export const demoAiRecommendations = [
  { id: 'rec_1', type: 'budget_allocation', priority: 'high', title: 'Increase Budget for Summer Sale', description: 'Campaign "Summer Sale 2026" is hitting a 3.2 ROAS. Recommend shifting $500/day from underperforming adsets.', impact: '+$1,500 expected weekly return' },
  { id: 'rec_2', type: 'creative_fatigue', priority: 'medium', title: 'Refresh Static Image Ad', description: 'Creative "Static Image - Discount" has seen a 25% drop in CTR over the last 3 days.', impact: 'Improves CTR by ~1.5%' },
  { id: 'rec_3', type: 'audience_expansion', priority: 'low', title: 'Test 2% Lookalike', description: 'Your 1% LAL is performing well but nearing frequency limits. Consider testing 2% LAL.', impact: 'Scales volume by 40%' },
];

export const demoData = {
  accounts: demoAccounts,
  overview: demoOverview,
  charts: demoCharts,
  campaigns: demoCampaigns,
  adsets: demoAdsets,
  creatives: demoCreatives,
  breakdowns: demoBreakdowns,
  recommendations: demoAiRecommendations
};
