import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

export const requestAccess = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    company: v.string(),
    website: v.string(),
    email: v.string(),
    teamSize: v.string(),
    requirements: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await requireTenantAccess(ctx, args.organizationId);

    // Prevent duplicate pending requests
    const existing = await ctx.db
      .query("premiumRequests")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      throw new Error("You already have a pending premium request.");
    }

    const requestId = await ctx.db.insert("premiumRequests", {
      userId: user._id,
      organizationId: args.organizationId,
      name: args.name,
      email: args.email,
      company: args.company,
      website: args.website,
      teamSize: args.teamSize,
      requirements: args.requirements,
      status: "pending",
      createdAt: Date.now(),
    });

    // We can emit a webhook or email via an internal action here in the future
    return requestId;
  },
});

export const getStatus = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);

    return await ctx.db
      .query("premiumRequests")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();
  },
});
