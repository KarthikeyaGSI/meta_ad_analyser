import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";
import { enforceRole } from "./lib/rbac";

export const getFlags = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("featureFlags")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const setFlag = mutation({
  args: {
    organizationId: v.id("organizations"),
    featureName: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireTenantAccess(ctx, args.organizationId);
    enforceRole(membership, "admin", "modify feature flags");

    const existing = await ctx.db
      .query("featureFlags")
      .withIndex("by_org_and_feature", (q) => 
        q.eq("organizationId", args.organizationId).eq("featureName", args.featureName)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { enabled: args.enabled });
    } else {
      await ctx.db.insert("featureFlags", {
        organizationId: args.organizationId,
        featureName: args.featureName,
        enabled: args.enabled,
      });
    }
  },
});
