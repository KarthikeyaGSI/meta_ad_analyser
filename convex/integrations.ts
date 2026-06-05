import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

export const saveMetaIntegration = mutation({
  args: {
    organizationId: v.id("organizations"),
    accountId: v.string(),
    accessToken: v.string(),
    customName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    
    // Check if integration already exists
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("provider"), "meta"))
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        customName: args.customName,
        status: "active",
        lastSyncedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("integrations", {
      organizationId: args.organizationId,
      provider: "meta",
      accountId: args.accountId,
      accessToken: args.accessToken,
      customName: args.customName,
      status: "active",
      lastSyncedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getIntegrations = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("integrations")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});
