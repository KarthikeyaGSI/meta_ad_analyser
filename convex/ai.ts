import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Mutation to check and deduct AI credits
export const checkAndDeductQuota = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    creditsNeeded: v.number(),
  },
  handler: async (ctx, args) => {
    // Get usage tracking record for org
    let usage = await ctx.db
      .query("usageTracking")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();

    if (!usage) {
      // Initialize usage tracking if it doesn't exist
      const usageId = await ctx.db.insert("usageTracking", {
        organizationId: args.organizationId,
        apiCalls: 0,
        aiCredits: 100, // starting free credits
        reportsGenerated: 0,
        storageUsed: 0,
        monthlyUsage: 0,
        updatedAt: Date.now(),
      });
      usage = await ctx.db.get(usageId);
    }

    if (!usage || usage.aiCredits < args.creditsNeeded) {
      throw new Error("Insufficient AI credits. Please upgrade your plan.");
    }

    // Deduct credits
    await ctx.db.patch(usage._id, {
      aiCredits: usage.aiCredits - args.creditsNeeded,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Example AI Action that enforces quota
export const generateInsights = action({
  args: {
    organizationId: v.id("organizations"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Enforce Quota
    const creditsNeeded = 5;
    try {
      await ctx.runMutation(internal.ai.checkAndDeductQuota, {
        organizationId: args.organizationId,
        creditsNeeded,
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    // 2. Call AI API (Simulated)
    console.log(`[AI Engine] Generating insights for org ${args.organizationId} (Cost: ${creditsNeeded} credits)`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { 
      success: true, 
      insights: `Simulated AI insights for prompt: "${args.prompt}"` 
    };
  },
});
