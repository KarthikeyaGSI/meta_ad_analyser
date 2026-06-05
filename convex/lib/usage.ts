import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function incrementApiUsage(ctx: MutationCtx, organizationId: Id<"organizations">, count = 1) {
  const usageTracker = await ctx.db
    .query("usageTracking")
    .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
    .unique();

  if (usageTracker) {
    await ctx.db.patch(usageTracker._id, {
      apiCalls: usageTracker.apiCalls + count,
      updatedAt: Date.now(),
    });
  } else {
    // Edge case if missing, create one
    await ctx.db.insert("usageTracking", {
      organizationId,
      apiCalls: count,
      aiCredits: 0,
      reportsGenerated: 0,
      storageUsed: 0,
      monthlyUsage: count,
      updatedAt: Date.now(),
    });
  }
}

export async function incrementAiCredits(ctx: MutationCtx, organizationId: Id<"organizations">, creditsUsed: number) {
  const usageTracker = await ctx.db
    .query("usageTracking")
    .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
    .unique();

  if (usageTracker) {
    await ctx.db.patch(usageTracker._id, {
      aiCredits: usageTracker.aiCredits + creditsUsed,
      updatedAt: Date.now(),
    });
  }
}
