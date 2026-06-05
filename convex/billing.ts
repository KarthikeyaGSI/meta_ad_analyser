import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

export const getSubscription = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .first();
  },
});

export const getUsage = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("usageTracking")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .unique();
  },
});

// Internal webhook handlers called via Stripe endpoint
export const updateSubscriptionInternal = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("growth"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    status: v.union(v.literal("active"), v.literal("past_due"), v.literal("canceled"), v.literal("trialing")),
    renewalDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the subscription by sub ID
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .unique();

    if (sub) {
      await ctx.db.patch(sub._id, {
        plan: args.plan,
        status: args.status,
        renewalDate: args.renewalDate,
        updatedAt: Date.now(),
      });
      
      // Update org plan
      await ctx.db.patch(sub.organizationId, {
        plan: args.plan,
      });
    }
  },
});

export const checkTrialExpirations = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Simulated: Check all organizations on trial that expire today and email them
    console.log("[Cron] Checking for trial expirations...");
  },
});
