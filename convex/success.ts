import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

export const getActivationScore = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);

    // 1. Check Workspaces
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
    
    // 2. Check Team Size
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // 3. Check Premium Request
    const premiumRequest = await ctx.db
      .query("premiumRequests")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    // 4. Check Usage
    const usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    let score = 20; // Base score for org creation
    if (workspaces.length > 0) score += 20;
    if (teamMembers.length > 1) score += 20; // Invited team
    if (usage && usage.apiCalls > 10) score += 20; // Feature adoption
    if (premiumRequest) score += 20;

    return {
      activationPercentage: score,
      adoptionPercentage: (usage?.apiCalls || 0) > 50 ? 100 : Math.min(100, (usage?.apiCalls || 0) * 2),
      usagePercentage: usage ? Math.min(100, (usage.monthlyUsage / 1000) * 100) : 0,
      healthScore: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Attention',
      metrics: {
        workspaces: workspaces.length,
        teamSize: teamMembers.length,
        apiCalls: usage?.apiCalls || 0,
        premiumRequested: !!premiumRequest
      }
    };
  },
});
