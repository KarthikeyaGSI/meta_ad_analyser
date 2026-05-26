import { db, Campaign, Adset, Ad, Creative, DailyInsight, HourlyInsight, MetaAccount } from '../database/dbClient';

export class SandboxEngine {
  static async seedDemoData(userId: string): Promise<string> {
    // Seed Apparels Account
    await this.seedAccount(
      userId,
      'demo-act-id', // default/legacy id
      'act_77491038201',
      'Aetheris Apparels Ltd. (Demo Sandbox)',
      'apparel'
    );

    // Seed Cosmetics Account
    await this.seedAccount(
      userId,
      'demo-cosmetics-id',
      'act_99182047382',
      'Aetheris Cosmetics Ltd. (Demo Sandbox)',
      'cosmetics'
    );

    return 'demo-act-id'; // Return the default active one
  }

  private static async seedAccount(
    userId: string,
    accountId: string,
    actId: string,
    accountName: string,
    niche: 'apparel' | 'cosmetics'
  ): Promise<void> {
    // 1. Create Meta Account record
    const account: MetaAccount = {
      id: accountId,
      userId,
      actId,
      name: accountName,
      accessToken: `EAAdsa89fha89fhasdf89ashf89asdf7ha9hsd_demo_${niche}`,
      status: 'ACTIVE',
      currency: 'USD',
      timezone: 'America/New_York',
      lastSyncedAt: new Date().toISOString(),
    };
    await db.upsertMetaAccount(account);

    // 2. Create Creatives based on Niche
    let creatives: Creative[] = [];
    if (niche === 'apparel') {
      creatives = [
        {
          id: 'cr-ugc-winner',
          creativeId: '1202039401201',
          name: 'UGC Video - Customer Review Hook',
          headline: 'The Only Activewear You Need in 2026',
          body: 'Over 10,000+ fitness enthusiasts choose Aetheris. Try today with free shipping and 30-day returns!',
          imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'SHOP_NOW',
        },
        {
          id: 'cr-carousel-decayed',
          creativeId: '1202039401202',
          name: 'Product Carousel - Pastel Collection',
          headline: 'Clean Aesthetics Meet Maximum Comfort',
          body: 'Crafted with premium materials. Slide to explore our best-selling lightweight colorways.',
          imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'SHOP_NOW',
        },
        {
          id: 'cr-image-cpm-spike',
          creativeId: '1202039401203',
          name: 'Founder Image - Story Overlay',
          headline: 'Why We Designed Aetheris',
          body: 'A letter from our founder on sustainable design and performance testing. Click to read our story.',
          imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'LEARN_MORE',
        }
      ];
    } else {
      creatives = [
        {
          id: 'cr-cosm-ugc',
          creativeId: '2202039401201',
          name: 'UGC Skincare Routine - Before & After Glow',
          headline: 'Real Glow In Under 7 Days ✨',
          body: 'Say goodbye to dry, uneven skin. Formulated with organic serums. Order today and get 15% off!',
          imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'SHOP_NOW',
        },
        {
          id: 'cr-cosm-catalog',
          creativeId: '2202039401202',
          name: 'Product Catalog - Serum & Tint Duo',
          headline: 'Hydrate & Enhance (Skincare Meets Makeup)',
          body: 'Perfect your minimal daily routine. Vegan, cruelty-free lip tints and hydrating serums available now.',
          imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'SHOP_NOW',
        },
        {
          id: 'cr-cosm-video',
          creativeId: '2202039401203',
          name: 'Esthetician Review - Formula Breakdown',
          headline: 'Why Dermatologists Approve of Aetheris Beauty',
          body: 'Clinical proof, clean ingredients, incredible results. Watch Dr. Aris dissect our active serum formula.',
          imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&auto=format&fit=crop',
          callToActionType: 'LEARN_MORE',
        }
      ];
    }
    await db.upsertCreatives(creatives);

    // 3. Create Campaigns
    let campaigns: Campaign[] = [];
    if (niche === 'apparel') {
      campaigns = [
        {
          id: `c-winner-prospecting-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_winner_prospecting_${niche}`,
          name: '🎯 [Scale] Prospecting - Lookalike 1-5% (UGC Winner)',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 500,
          createdTime: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `c-retargeting-decay-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_retargeting_decay_${niche}`,
          name: '🔄 [Retargeting] Custom Audiences - Add To Cart (Carousel)',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 150,
          createdTime: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `c-broad-cpm-spike-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_broad_cpm_spike_${niche}`,
          name: '🌍 [Test] Broad Interests - Founder Story',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 100,
          createdTime: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
    } else {
      campaigns = [
        {
          id: `c-winner-prospecting-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_winner_prospecting_${niche}`,
          name: '✨ [Brand] Prospecting - Skincare Glow Serum (UGC Serum)',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 350,
          createdTime: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `c-retargeting-decay-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_retargeting_decay_${niche}`,
          name: '🛍️ [Retargeting] Dynamic Catalog - Beauty Buyers (Duo Tint)',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 120,
          createdTime: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `c-broad-cpm-spike-${accountId}`,
          metaAccountId: accountId,
          campaignId: `c_broad_cpm_spike_${niche}`,
          name: '💄 [Test] Broad Interests - Makeup Artistry (Dr. Aris Video)',
          status: 'ACTIVE',
          objective: 'OUTCOMES',
          buyingType: 'AUCTION',
          budget: 80,
          createdTime: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
    }
    await db.upsertCampaigns(campaigns);

    // 4. Create Adsets
    let adsets: Adset[] = [];
    if (niche === 'apparel') {
      adsets = [
        {
          id: `as-prospecting-winner-${accountId}`,
          campaignId: `c-winner-prospecting-${accountId}`,
          adsetId: `as_winner_prospecting_1_${niche}`,
          name: 'US - LAL 1-5% Purchases (30D) - 25-54',
          status: 'ACTIVE',
          targeting: { age_min: 25, age_max: 54, gender: 'ALL', custom_audiences: ['Purchase LAL'] },
          budget: 500,
        },
        {
          id: `as-retargeting-decay-${accountId}`,
          campaignId: `c-retargeting-decay-${accountId}`,
          adsetId: `as_retargeting_decay_1_${niche}`,
          name: 'US - Add To Cart (14D) Exclude Purchases',
          status: 'ACTIVE',
          targeting: { age_min: 18, age_max: 65, gender: 'ALL', custom_audiences: ['ATC 14D'] },
          budget: 150,
        },
        {
          id: `as-broad-cpm-spike-${accountId}`,
          campaignId: `c-broad-cpm-spike-${accountId}`,
          adsetId: `as_broad_cpm_spike_1_${niche}`,
          name: 'US - Broad Interests (Activewear & Yoga)',
          status: 'ACTIVE',
          targeting: { age_min: 18, age_max: 45, gender: 'FEMALE', interests: ['Yoga', 'Athleisure'] },
          budget: 100,
        }
      ];
    } else {
      adsets = [
        {
          id: `as-prospecting-winner-${accountId}`,
          campaignId: `c-winner-prospecting-${accountId}`,
          adsetId: `as_winner_prospecting_1_${niche}`,
          name: 'US - LAL 1-3% Purchases - Beauty Interests - 18-44',
          status: 'ACTIVE',
          targeting: { age_min: 18, age_max: 44, gender: 'ALL', custom_audiences: ['Purchase LAL Beauty'] },
          budget: 350,
        },
        {
          id: `as-retargeting-decay-${accountId}`,
          campaignId: `c-retargeting-decay-${accountId}`,
          adsetId: `as_retargeting_decay_1_${niche}`,
          name: 'US - Skin/Cosm ATC (7D) - Recurrent Visitors',
          status: 'ACTIVE',
          targeting: { age_min: 18, age_max: 65, gender: 'ALL', custom_audiences: ['Beauty ATC 7D'] },
          budget: 120,
        },
        {
          id: `as-broad-cpm-spike-${accountId}`,
          campaignId: `c-broad-cpm-spike-${accountId}`,
          adsetId: `as_broad_cpm_spike_1_${niche}`,
          name: 'US - Broad Beauty (Skincare, Cosmetics, Estheticians)',
          status: 'ACTIVE',
          targeting: { age_min: 18, age_max: 54, gender: 'FEMALE', interests: ['Skincare', 'Cosmetics', 'Makeup'] },
          budget: 80,
        }
      ];
    }
    await db.upsertAdsets(adsets);

    // 5. Create Ads
    let ads: Ad[] = [];
    if (niche === 'apparel') {
      ads = [
        {
          id: `ad-prospecting-winner-${accountId}`,
          adsetId: `as-prospecting-winner-${accountId}`,
          adId: `ad_prospecting_winner_ugc_${niche}`,
          name: 'UGC Ad - Winner Hook V1',
          status: 'ACTIVE',
          creativeId: '1202039401201',
        },
        {
          id: `ad-retargeting-decay-${accountId}`,
          adsetId: `as-retargeting-decay-${accountId}`,
          adId: `ad_retargeting_decay_carousel_${niche}`,
          name: 'Carousel Ad - Pastel Grid',
          status: 'ACTIVE',
          creativeId: '1202039401202',
        },
        {
          id: `ad-broad-cpm-spike-${accountId}`,
          adsetId: `as-broad-cpm-spike-${accountId}`,
          adId: `ad_broad_cpm_spike_founder_${niche}`,
          name: 'Image Ad - Founder Story Card',
          status: 'ACTIVE',
          creativeId: '1202039401203',
        }
      ];
    } else {
      ads = [
        {
          id: `ad-prospecting-winner-${accountId}`,
          adsetId: `as-prospecting-winner-${accountId}`,
          adId: `ad_prospecting_winner_ugc_${niche}`,
          name: 'UGC Ad - Before/After Serum Hook V2',
          status: 'ACTIVE',
          creativeId: '2202039401201',
        },
        {
          id: `ad-retargeting-decay-${accountId}`,
          adsetId: `as-retargeting-decay-${accountId}`,
          adId: `ad_retargeting_decay_carousel_${niche}`,
          name: 'Catalog Ad - Serum & Tint Duo Grid',
          status: 'ACTIVE',
          creativeId: '2202039401202',
        },
        {
          id: `ad-broad-cpm-spike-${accountId}`,
          adsetId: `as-broad-cpm-spike-${accountId}`,
          adId: `ad_broad_cpm_spike_founder_${niche}`,
          name: 'Video Ad - Dr. Aris Formula Breakdown',
          status: 'ACTIVE',
          creativeId: '2202039401203',
        }
      ];
    }
    await db.upsertAds(ads);

    // 6. Generate Coherent 180 Days of Daily and Hourly Insights
    const dailyInsights: DailyInsight[] = [];
    const hourlyInsights: HourlyInsight[] = [];

    const now = new Date();
    const TOTAL_DAYS = 180;

    // Niche based constant parameters
    const avgOrderValue = niche === 'apparel' ? 85.0 : 65.0;
    const baseCpm1 = niche === 'apparel' ? 12.5 : 10.5;
    const baseCtr1 = niche === 'apparel' ? 2.4 : 3.2;
    const baseConv1 = niche === 'apparel' ? 0.055 : 0.065;
    const baseBudget1 = niche === 'apparel' ? 500 : 350;

    const baseBudget2 = niche === 'apparel' ? 150 : 120;
    const baseCpm2 = niche === 'apparel' ? 20.0 : 16.0;
    const baseCtr2 = niche === 'apparel' ? 4.2 : 5.0;
    const baseConv2 = niche === 'apparel' ? 0.08 : 0.09;

    const baseBudget3 = niche === 'apparel' ? 100 : 80;
    const baseCpm3 = niche === 'apparel' ? 22.0 : 18.0;
    const baseCtr3 = niche === 'apparel' ? 1.35 : 1.75;
    const baseConv3 = niche === 'apparel' ? 0.024 : 0.028;

    for (let dayOffset = TOTAL_DAYS; dayOffset >= 0; dayOffset--) {
      const currentDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0];
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      // Periodic season scale curves (simulates sales trends over months)
      // Math.sin provides wave cycles over 180 days
      const seasonScale = 1.0 + Math.sin((TOTAL_DAYS - dayOffset) / 25) * 0.15 + (isWeekend ? 0.10 : -0.05);

      // -------------------------------------------------------------------
      // CAMPAIGN 1: PROSPECTING (Scale, Coherent High Performance)
      // -------------------------------------------------------------------
      let camp1Spend = baseBudget1 * seasonScale * (1 + Math.sin(dayOffset / 3) * 0.08);
      if (isWeekend) camp1Spend *= 1.15;

      const camp1CTR = baseCtr1 + Math.sin(dayOffset / 8) * 0.15 + Math.random() * 0.1;
      const camp1CPM = baseCpm1 + Math.cos(dayOffset / 12) * 0.6 + Math.random() * 0.3;

      const camp1Impressions = Math.round((camp1Spend / camp1CPM) * 1000);
      const camp1Clicks = Math.round(camp1Impressions * (camp1CTR / 100));
      const camp1CPC = camp1Spend / (camp1Clicks || 1);

      const camp1Purchases = Math.round(camp1Clicks * (baseConv1 + (isWeekend ? 0.012 : 0)));
      const basketValue = avgOrderValue + Math.sin(dayOffset / 5) * 4;
      const camp1Revenue = camp1Purchases * basketValue;

      const camp1ROAS = camp1Revenue / camp1Spend;
      const camp1CPA = camp1Spend / (camp1Purchases || 1);
      // Frequency rises gradually from 1.1 to 1.5
      const camp1Frequency = 1.1 + ((TOTAL_DAYS - dayOffset) * (0.45 / TOTAL_DAYS));

      const di1: DailyInsight = {
        id: `di-c1-${niche}-${dateString}`,
        entityType: 'CAMPAIGN',
        entityId: `c_winner_prospecting_${niche}`,
        date: dateString,
        spend: parseFloat(camp1Spend.toFixed(2)),
        impressions: camp1Impressions,
        clicks: camp1Clicks,
        purchases: camp1Purchases,
        revenue: parseFloat(camp1Revenue.toFixed(2)),
        ctr: parseFloat(camp1CTR.toFixed(2)),
        cpc: parseFloat(camp1CPC.toFixed(2)),
        cpm: parseFloat(camp1CPM.toFixed(2)),
        roas: parseFloat(camp1ROAS.toFixed(2)),
        cpa: parseFloat(camp1CPA.toFixed(2)),
        frequency: parseFloat(camp1Frequency.toFixed(2)),
        deviceBreakdown: { ios: 0.73, android: 0.20, desktop: 0.07 },
        placementBreakdown: { instagram_reels: 0.48, facebook_feed: 0.34, audience_network: 0.18 },
        demographics: {
          '25-34': { spend: camp1Spend * 0.45, purchases: Math.round(camp1Purchases * 0.50) },
          '35-44': { spend: camp1Spend * 0.35, purchases: Math.round(camp1Purchases * 0.35) },
          '45-54': { spend: camp1Spend * 0.20, purchases: Math.round(camp1Purchases * 0.15) }
        }
      };
      dailyInsights.push(di1);
      dailyInsights.push({ ...di1, id: `di-as1-${niche}-${dateString}`, entityType: 'ADSET', entityId: `as_winner_prospecting_1_${niche}` });
      dailyInsights.push({ ...di1, id: `di-ad1-${niche}-${dateString}`, entityType: 'AD', entityId: `ad_prospecting_winner_ugc_${niche}` });

      // -------------------------------------------------------------------
      // CAMPAIGN 2: RETARGETING DECAY (Audience Fatiguing)
      // -------------------------------------------------------------------
      const camp2Spend = baseBudget2;
      // Decays every 35 days and gets refreshed: Math.sin cycle models creative fatigue & manual updates
      const phase = (TOTAL_DAYS - dayOffset) % 35; // 35 day fatigue cycles
      const fatigueFactor = Math.max(0.12, 1.0 - (phase / 35) * 0.78); // climbs to 1, decays to 0.22

      const camp2CTR = baseCtr2 * fatigueFactor + Math.random() * 0.15;
      const cpmScaler = 1.0 + (phase / 35) * 0.65; // CPM rises as audience fatigues
      const camp2CPM = baseCpm2 * cpmScaler + Math.random() * 1.5;

      const camp2Impressions = Math.round((camp2Spend / camp2CPM) * 1000);
      const camp2Clicks = Math.round(camp2Impressions * (camp2CTR / 100));
      const camp2CPC = camp2Spend / (camp2Clicks || 1);

      const camp2Purchases = Math.round(camp2Clicks * baseConv2 * fatigueFactor);
      const camp2Revenue = camp2Purchases * (avgOrderValue - 10.0);

      const camp2ROAS = camp2Revenue / camp2Spend;
      const camp2CPA = camp2Spend / (camp2Purchases || 1);
      // Frequency peaks right before refresh, then resets
      const camp2Frequency = 1.8 + (phase * (3.8 / 35));

      const di2: DailyInsight = {
        id: `di-c2-${niche}-${dateString}`,
        entityType: 'CAMPAIGN',
        entityId: `c_retargeting_decay_${niche}`,
        date: dateString,
        spend: parseFloat(camp2Spend.toFixed(2)),
        impressions: camp2Impressions,
        clicks: camp2Clicks,
        purchases: camp2Purchases,
        revenue: parseFloat(camp2Revenue.toFixed(2)),
        ctr: parseFloat(camp2CTR.toFixed(2)),
        cpc: parseFloat(camp2CPC.toFixed(2)),
        cpm: parseFloat(camp2CPM.toFixed(2)),
        roas: parseFloat(camp2ROAS.toFixed(2)),
        cpa: parseFloat(camp2CPA.toFixed(2)),
        frequency: parseFloat(camp2Frequency.toFixed(2)),
        deviceBreakdown: { ios: 0.64, android: 0.26, desktop: 0.10 },
        placementBreakdown: { instagram_stories: 0.52, facebook_feed: 0.38, messenger: 0.10 },
        demographics: {
          '18-24': { spend: camp2Spend * 0.32, purchases: Math.round(camp2Purchases * 0.25) },
          '25-34': { spend: camp2Spend * 0.48, purchases: Math.round(camp2Purchases * 0.55) },
          '35-44': { spend: camp2Spend * 0.20, purchases: Math.round(camp2Purchases * 0.20) }
        }
      };
      dailyInsights.push(di2);
      dailyInsights.push({ ...di2, id: `di-as2-${niche}-${dateString}`, entityType: 'ADSET', entityId: `as_retargeting_decay_1_${niche}` });
      dailyInsights.push({ ...di2, id: `di-ad2-${niche}-${dateString}`, entityType: 'AD', entityId: `ad_retargeting_decay_carousel_${niche}` });

      // -------------------------------------------------------------------
      // CAMPAIGN 3: BROAD INTERESTS (Founder Story, Periodic Spikes)
      // -------------------------------------------------------------------
      const camp3Spend = baseBudget3;
      // Periodic spikes simulate global auction spikes e.g. Black Friday, Christmas, summer surges
      const isCpmSpikeDay = 
        (dayOffset >= 12 && dayOffset <= 16) || 
        (dayOffset >= 65 && dayOffset <= 70) || 
        (dayOffset >= 120 && dayOffset <= 126);

      const camp3CPM = isCpmSpikeDay 
        ? baseCpm3 * 1.6 + Math.random() * 2.5
        : baseCpm3 + Math.random() * 1.5;

      const camp3CTR = baseCtr3 + Math.random() * 0.12;
      const camp3Impressions = Math.round((camp3Spend / camp3CPM) * 1000);
      const camp3Clicks = Math.round(camp3Impressions * (camp3CTR / 100));
      const camp3CPC = camp3Spend / (camp3Clicks || 1);

      const camp3ConvRate = isCpmSpikeDay ? baseConv3 * 0.55 : baseConv3;
      const camp3Purchases = Math.round(camp3Clicks * camp3ConvRate);
      const camp3Revenue = camp3Purchases * (avgOrderValue * 1.35); // larger basket item

      const camp3ROAS = camp3Revenue / camp3Spend;
      const camp3CPA = camp3Spend / (camp3Purchases || 1);
      const camp3Frequency = 1.05 + ((TOTAL_DAYS - dayOffset) * (0.18 / TOTAL_DAYS));

      const di3: DailyInsight = {
        id: `di-c3-${niche}-${dateString}`,
        entityType: 'CAMPAIGN',
        entityId: `c_broad_cpm_spike_${niche}`,
        date: dateString,
        spend: parseFloat(camp3Spend.toFixed(2)),
        impressions: camp3Impressions,
        clicks: camp3Clicks,
        purchases: camp3Purchases,
        revenue: parseFloat(camp3Revenue.toFixed(2)),
        ctr: parseFloat(camp3CTR.toFixed(2)),
        cpc: parseFloat(camp3CPC.toFixed(2)),
        cpm: parseFloat(camp3CPM.toFixed(2)),
        roas: parseFloat(camp3ROAS.toFixed(2)),
        cpa: parseFloat(camp3CPA.toFixed(2)),
        frequency: parseFloat(camp3Frequency.toFixed(2)),
        deviceBreakdown: { ios: 0.82, android: 0.13, desktop: 0.05 },
        placementBreakdown: { facebook_feed: 0.58, instagram_feed: 0.36, audience_network: 0.06 },
        demographics: {
          '18-24': { spend: camp3Spend * 0.22, purchases: Math.round(camp3Purchases * 0.12) },
          '25-34': { spend: camp3Spend * 0.48, purchases: Math.round(camp3Purchases * 0.58) },
          '35-44': { spend: camp3Spend * 0.30, purchases: Math.round(camp3Purchases * 0.30) }
        }
      };
      dailyInsights.push(di3);
      dailyInsights.push({ ...di3, id: `di-as3-${niche}-${dateString}`, entityType: 'ADSET', entityId: `as_broad_cpm_spike_1_${niche}` });
      dailyInsights.push({ ...di3, id: `di-ad3-${niche}-${dateString}`, entityType: 'AD', entityId: `ad_broad_cpm_spike_founder_${niche}` });

      // -------------------------------------------------------------------
      // 7. HOURLY INSIGHT GENERATION (Only past 3 days)
      // -------------------------------------------------------------------
      if (dayOffset <= 2) {
        const hourlyTrafficProfiles = [
          0.015, 0.010, 0.005, 0.003, 0.005, 0.015,
          0.035, 0.045, 0.055, 0.050, 0.048, 0.045,
          0.042, 0.040, 0.038, 0.040, 0.055, 0.070,
          0.095, 0.105, 0.110, 0.090, 0.050, 0.029
        ];

        for (let hour = 0; hour < 24; hour++) {
          const hourStr = hour.toString().padStart(2, '0');
          const timestamp = `${dateString}T${hourStr}:00:00.000Z`;
          const weight = hourlyTrafficProfiles[hour];

          // Distribution of daily values
          // Campaign 1
          const h1Spend = camp1Spend * weight;
          const h1Imps = Math.round(camp1Impressions * weight);
          const h1Clicks = Math.round(camp1Clicks * weight);
          const h1Purchases = Math.round(camp1Purchases * weight);
          const h1Revenue = h1Purchases * basketValue;

          hourlyInsights.push({
            id: `hi-c1-${niche}-${dateString}-${hour}`,
            entityType: 'CAMPAIGN',
            entityId: `c_winner_prospecting_${niche}`,
            timestamp,
            spend: parseFloat(h1Spend.toFixed(2)),
            impressions: h1Imps,
            clicks: h1Clicks,
            purchases: h1Purchases,
            revenue: parseFloat(h1Revenue.toFixed(2)),
            ctr: parseFloat(((h1Clicks / (h1Imps || 1)) * 100).toFixed(2)),
            cpc: parseFloat((h1Spend / (h1Clicks || 1)).toFixed(2)),
            cpm: parseFloat(((h1Spend / (h1Imps || 1)) * 1000).toFixed(2)),
            roas: parseFloat((h1Revenue / (h1Spend || 1)).toFixed(2)),
            cpa: parseFloat((h1Spend / (h1Purchases || 1)).toFixed(2))
          });

          // Campaign 2
          const h2Spend = camp2Spend * weight;
          const h2Imps = Math.round(camp2Impressions * weight);
          const h2Clicks = Math.round(camp2Clicks * weight);
          const h2Purchases = Math.round(camp2Purchases * weight);
          const h2Revenue = h2Purchases * (avgOrderValue - 10.0);

          hourlyInsights.push({
            id: `hi-c2-${niche}-${dateString}-${hour}`,
            entityType: 'CAMPAIGN',
            entityId: `c_retargeting_decay_${niche}`,
            timestamp,
            spend: parseFloat(h2Spend.toFixed(2)),
            impressions: h2Imps,
            clicks: h2Clicks,
            purchases: h2Purchases,
            revenue: parseFloat(h2Revenue.toFixed(2)),
            ctr: parseFloat(((h2Clicks / (h2Imps || 1)) * 100).toFixed(2)),
            cpc: parseFloat((h2Spend / (h2Clicks || 1)).toFixed(2)),
            cpm: parseFloat(((h2Spend / (h2Imps || 1)) * 1000).toFixed(2)),
            roas: parseFloat((h2Revenue / (h2Spend || 1)).toFixed(2)),
            cpa: parseFloat((h2Spend / (h2Purchases || 1)).toFixed(2))
          });

          // Campaign 3
          const h3Spend = camp3Spend * weight;
          const h3Imps = Math.round(camp3Impressions * weight);
          const h3Clicks = Math.round(camp3Clicks * weight);
          const h3Purchases = Math.round(camp3Purchases * weight);
          const h3Revenue = h3Purchases * (avgOrderValue * 1.35);

          hourlyInsights.push({
            id: `hi-c3-${niche}-${dateString}-${hour}`,
            entityType: 'CAMPAIGN',
            entityId: `c_broad_cpm_spike_${niche}`,
            timestamp,
            spend: parseFloat(h3Spend.toFixed(2)),
            impressions: h3Imps,
            clicks: h3Clicks,
            purchases: h3Purchases,
            revenue: parseFloat(h3Revenue.toFixed(2)),
            ctr: parseFloat(((h3Clicks / (h3Imps || 1)) * 100).toFixed(2)),
            cpc: parseFloat((h3Spend / (h3Clicks || 1)).toFixed(2)),
            cpm: parseFloat(((h3Spend / (h3Imps || 1)) * 1000).toFixed(2)),
            roas: parseFloat((h3Revenue / (h3Spend || 1)).toFixed(2)),
            cpa: parseFloat((h3Spend / (h3Purchases || 1)).toFixed(2))
          });
        }
      }
    }

    // Write all to Database
    await db.upsertDailyInsights(dailyInsights);
    await db.upsertHourlyInsights(hourlyInsights);

    console.log(`[Aetheris Sandbox] Seeded 180-day high-fidelity analytics history for: ${accountName}`);
  }
}
