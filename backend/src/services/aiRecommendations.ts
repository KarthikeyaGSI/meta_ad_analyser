import { db, DailyInsight, Campaign } from '../database/dbClient';

export interface Recommendation {
  id: string;
  type: 'WARNING' | 'ALERT' | 'OPPORTUNITY' | 'ALERT_SATURATION';
  title: string;
  metric: string;
  value: string;
  confidence: number; // Percentage (e.g. 87)
  campaignName: string;
  campaignId: string;
  description: string;
  actionableStep: string;
}

/**
 * Fits a linear regression line (y = mx + c) over a numerical series
 */
function fitLinearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Calculates the standard score (Z-Score) of a value relative to a historical population
 */
function calculateZScore(value: number, history: number[]): number {
  const n = history.length;
  if (n < 5) return 0; // Require a minimum statistical population size
  
  const mean = history.reduce((sum, val) => sum + val, 0) / n;
  const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export class AiRecommendationEngine {
  static async generateRecommendations(metaAccountId: string): Promise<Recommendation[]> {
    const campaigns = await db.getCampaigns(metaAccountId);
    const recommendations: Recommendation[] = [];

    // Calculate dates for past analysis ranges (today relative to simulated history)
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    for (const c of campaigns) {
      // Get past 30 days insights for this campaign
      const insights = await db.getDailyInsights('CAMPAIGN', [c.campaignId], startDate, endDate);
      if (insights.length === 0) continue;

      // Sort chronological (oldest to newest)
      insights.sort((a, b) => a.date.localeCompare(b.date));

      // Fetch key aggregated values
      const recent3Days = insights.slice(-3);
      const prev3Days = insights.slice(-6, -3);
      const recent7Days = insights.slice(-7);
      const prev7Days = insights.slice(-14, -7);

      const latestInsight = insights[insights.length - 1];

      // Calculate recent aggregates
      const recentSpend = recent7Days.reduce((sum, i) => sum + i.spend, 0);
      const recentPurchases = recent7Days.reduce((sum, i) => sum + i.purchases, 0);
      const recentRevenue = recent7Days.reduce((sum, i) => sum + i.revenue, 0);
      const recentClicks = recent7Days.reduce((sum, i) => sum + i.clicks, 0);
      const recentImps = recent7Days.reduce((sum, i) => sum + i.impressions, 0);

      const recentCTR = recentImps > 0 ? (recentClicks / recentImps) * 100 : 0;
      const recentCPC = recentClicks > 0 ? recentSpend / recentClicks : 0;
      const recentCPM = recentImps > 0 ? (recentSpend / recentImps) * 1000 : 0;
      const recentROAS = recentSpend > 0 ? recentRevenue / recentSpend : 0;
      const latestFreq = latestInsight.frequency;

      // Extract historic arrays for statistical models
      const historicSpendSeries = insights.map(i => i.spend);
      const historicCpmSeries = insights.slice(0, -1).map(i => i.spend / (i.impressions || 1) * 1000);
      const latestCpm = latestInsight.impressions > 0 ? (latestInsight.spend / latestInsight.impressions) * 1000 : 0;

      // ----------------------------------------------------
      // RULE 1: Weak Creative Hook / Low CTR (< 1.2%)
      // ----------------------------------------------------
      if (recentSpend > 80 && recentCTR < 1.2) {
        const spendFactor = Math.min(45, (recentSpend / 200) * 45); // up to 45 pts
        const ctrFactor = Math.min(45, ((1.2 - recentCTR) / 1.2) * 45); // up to 45 pts
        const baseConfidence = 50 + spendFactor + ctrFactor;
        const confidence = Math.round(Math.min(98, baseConfidence));

        recommendations.push({
          id: `rec-ctr-${c.campaignId}`,
          type: 'WARNING',
          title: 'Weak Creative Attention Capturing (Low CTR)',
          metric: 'CTR (7D)',
          value: `${recentCTR.toFixed(2)}%`,
          confidence,
          campaignName: c.name,
          campaignId: c.campaignId,
          description: 'The click-through rate is below our 1.2% healthy baseline. This shows your current visual asset or hook (first 3 seconds) is failing to stop users from scrolling past in the feed.',
          actionableStep: 'Create 2 new visual assets with highly contrasting hook variations or text overlays. Test an interactive vertical format designed for Reels and Stories placements.'
        });
      }

      // ----------------------------------------------------
      // RULE 2: Audience Fatigue (Frequency > 3.0 & ROAS < 1.5)
      // ----------------------------------------------------
      if (latestFreq > 3.0 && recentROAS < 1.5) {
        const freqFactor = Math.min(40, ((latestFreq - 3.0) / 2) * 40); // up to 40 pts
        const roasFactor = Math.min(40, ((1.5 - recentROAS) / 1.5) * 40);
        const baseConfidence = 55 + freqFactor + roasFactor;
        const confidence = Math.round(Math.min(99, baseConfidence));

        recommendations.push({
          id: `rec-fatigue-${c.campaignId}`,
          type: 'ALERT',
          title: 'Critical Audience Saturation (Ad Fatigue)',
          metric: 'Frequency',
          value: `${latestFreq.toFixed(2)}x`,
          confidence,
          campaignName: c.name,
          campaignId: c.campaignId,
          description: 'Your audience frequency has exceeded 3.0 while campaign ROAS dropped. The same segment is repeatedly seeing your ads, causing click decay and driving acquisition costs up.',
          actionableStep: 'Examine and broaden your interest stack. Introduce a lookalike audience buffer (e.g. LAL 5-10% instead of 1-5%) and add negative retargeting lists for 30-day past purchasers.'
        });
      }

      // ----------------------------------------------------
      // RULE 3: Creative Saturation (CPC surged > 20% in last 3 days)
      // ----------------------------------------------------
      if (recent3Days.length === 3 && prev3Days.length === 3) {
        const spend3d = recent3Days.reduce((s, i) => s + i.spend, 0);
        const clicks3d = recent3Days.reduce((s, i) => s + i.clicks, 0);
        const cpc3d = clicks3d > 0 ? spend3d / clicks3d : 0;

        const prevSpend3d = prev3Days.reduce((s, i) => s + i.spend, 0);
        const prevClicks3d = prev3Days.reduce((s, i) => s + i.clicks, 0);
        const prevCpc3d = prevClicks3d > 0 ? prevSpend3d / prevClicks3d : 0;

        if (prevCpc3d > 0 && spend3d > 50) {
          const cpcIncrease = ((cpc3d - prevCpc3d) / prevCpc3d) * 100;
          if (cpcIncrease > 20) {
            const magnitudeFactor = Math.min(30, ((cpcIncrease - 20) / 40) * 30);
            const spendFactor = Math.min(40, (spend3d / 150) * 40);
            const confidence = Math.round(Math.min(97, 60 + magnitudeFactor + spendFactor));

            recommendations.push({
              id: `rec-saturation-${c.campaignId}`,
              type: 'ALERT_SATURATION',
              title: 'Rapid Cost-Per-Click Surge (Saturation Alert)',
              metric: 'CPC Increase (3D)',
              value: `+${cpcIncrease.toFixed(1)}%`,
              confidence,
              campaignName: c.name,
              campaignId: c.campaignId,
              description: 'The average Cost-Per-Click rose sharply in the last 72 hours. This is a primary indicator of rapid ad creative decay. Users are developing banner blindness to this visual asset.',
              actionableStep: 'Turn off the failing ad variant inside this campaign. Shift 100% of budget allocation to your secondary active creatives, or upload fresh visual angles immediately.'
            });
          }
        }
      }

      // ----------------------------------------------------
      // RULE 4: High-efficiency Scale Opportunity (ROAS > 3.0)
      // ----------------------------------------------------
      if (recentROAS > 2.8 && recentSpend > 100) {
        const roasFactor = Math.min(40, ((recentROAS - 2.8) / 2) * 40);
        const spendFactor = Math.min(40, (recentSpend / 1000) * 40);
        const consistencyPoints = insights.slice(-5).filter(i => i.roas >= 2.5).length * 4; // up to 20 pts
        const confidence = Math.round(Math.min(99, 40 + roasFactor + spendFactor + consistencyPoints));

        recommendations.push({
          id: `rec-scale-${c.campaignId}`,
          type: 'OPPORTUNITY',
          title: 'High-Efficiency Budget Scale Target',
          metric: 'ROAS (7D)',
          value: `${recentROAS.toFixed(2)}x`,
          confidence,
          campaignName: c.name,
          campaignId: c.campaignId,
          description: 'This campaign is achieving highly efficient performance, exceeding target ROAS. High volume stability shows the audience is broad enough to support increased budget without efficiency collapse.',
          actionableStep: 'Increase the daily campaign budget by 15% to 20% immediately. Re-evaluate the cost CPA trend in 48 hours to ensure auction delivery scaling remains stable.'
        });
      }

      // ----------------------------------------------------
      // RULE 5: CPM Surge Alert (CPM surged > 20% in 7 days)
      // ----------------------------------------------------
      if (recent7Days.length === 7 && prev7Days.length === 7) {
        const spend7d = recent7Days.reduce((s, i) => s + i.spend, 0);
        const imps7d = recent7Days.reduce((s, i) => s + i.impressions, 0);
        const cpm7d = imps7d > 0 ? (spend7d / imps7d) * 1000 : 0;

        const prevSpend7d = prev7Days.reduce((s, i) => s + i.spend, 0);
        const prevImps7d = prev7Days.reduce((s, i) => s + i.impressions, 0);
        const prevCpm7d = prevImps7d > 0 ? (prevSpend7d / prevImps7d) * 1000 : 0;

        if (prevCpm7d > 0 && spend7d > 100) {
          const cpmIncrease = ((cpm7d - prevCpm7d) / prevCpm7d) * 100;
          if (cpmIncrease > 20) {
            const magnitudeFactor = Math.min(30, ((cpmIncrease - 20) / 45) * 30);
            const spendFactor = Math.min(40, (spend7d / 300) * 40);
            const confidence = Math.round(Math.min(96, 60 + magnitudeFactor + spendFactor));

            recommendations.push({
              id: `rec-cpm-${c.campaignId}`,
              type: 'ALERT',
              title: 'Auction Placement Cost Surge (CPM Spike)',
              metric: 'CPM Increase (7D)',
              value: `+${cpmIncrease.toFixed(1)}%`,
              confidence,
              campaignName: c.name,
              campaignId: c.campaignId,
              description: 'The placement Cost-Per-Mille rose sharply compared to the previous week. This points to rising competitive pressure in the Meta auction, or negative customer feedback impacting your ad quality score.',
              actionableStep: 'Run landing page checks to make sure mobile load time is sub-2.0 seconds. Broaden audience filters, or adjust manual placements to focus solely on high-value feeds (FB/IG).'
            });
          }
        }
      }

      // ----------------------------------------------------
      // RULE 6: [NEW] Predictive Budget Pacing Deviation (Symmetric Regression)
      // ----------------------------------------------------
      if (historicSpendSeries.length >= 7 && c.budget > 0) {
        const { slope, intercept } = fitLinearRegression(historicSpendSeries);
        const next30DaysSpend = Array(30).fill(0).reduce((sum, _, idx) => {
          const projectedDaySpend = slope * (historicSpendSeries.length + idx) + intercept;
          return sum + Math.max(0, projectedDaySpend);
        }, 0);

        const currentMonthlyBudgetLimit = c.budget * 30;
        
        // If projected spend exceeds budget limit by 25%+
        if (next30DaysSpend > currentMonthlyBudgetLimit * 1.25) {
          const deviationPercent = ((next30DaysSpend - currentMonthlyBudgetLimit) / currentMonthlyBudgetLimit) * 100;
          const confidence = Math.round(Math.min(95, 50 + (deviationPercent / 2)));

          recommendations.push({
            id: `rec-pacing-${c.campaignId}`,
            type: 'WARNING',
            title: 'Predictive Overspend Target (Pacing Deviation)',
            metric: 'Projected Overspend',
            value: `+${deviationPercent.toFixed(0)}%`,
            confidence,
            campaignName: c.name,
            campaignId: c.campaignId,
            description: `Our linear regression model projects a month-end spend of $${next30DaysSpend.toFixed(2)} against your monthly budget framework of $${currentMonthlyBudgetLimit.toFixed(2)}. The campaign is pacing rapidly ahead of daily budgets.`,
            actionableStep: 'Establish a strict daily spend ceiling inside your Meta Ad Set settings, or re-adjust the campaign budget threshold downwards by 15% to slow active delivery.'
          });
        }
      }

      // ----------------------------------------------------
      // RULE 7: [NEW] Statistical CPM Anomaly Alert (Z-Score Spike)
      // ----------------------------------------------------
      if (historicCpmSeries.length >= 7 && latestCpm > 0) {
        const cpmZScore = calculateZScore(latestCpm, historicCpmSeries);
        
        // Z-score greater than +2.0 standard deviations is a major statistical anomaly
        if (cpmZScore > 2.0) {
          const confidence = Math.round(Math.min(98, 70 + (cpmZScore * 7)));

          recommendations.push({
            id: `rec-zscore-${c.campaignId}`,
            type: 'ALERT',
            title: 'Statistical Auction Volatility Anomaly (CPM Z-Score)',
            metric: 'CPM Z-Score',
            value: `+${cpmZScore.toFixed(2)} SD`,
            confidence,
            campaignName: c.name,
            campaignId: c.campaignId,
            description: `The latest placement CPM of $${latestCpm.toFixed(2)} is a verified statistical anomaly. It is sitting +${cpmZScore.toFixed(2)} standard deviations above the campaign's 30-day historical mean, signaling high auction density.`,
            actionableStep: 'Check if duplicate audiences are running across other campaigns creating self-competition in the auction. If CPM remains high for 48h, pause targeting layers.'
          });
        }
      }
    }

    // Sort: Alerts & Warnings first, then Opportunities, ordered by highest confidence
    return recommendations.sort((a, b) => {
      const typePriority = { ALERT: 4, ALERT_SATURATION: 3, WARNING: 2, OPPORTUNITY: 1 };
      const priorityA = typePriority[a.type] || 0;
      const priorityB = typePriority[b.type] || 0;
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      return b.confidence - a.confidence;
    });
  }
}
