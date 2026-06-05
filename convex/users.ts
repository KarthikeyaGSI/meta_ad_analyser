import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireUserDoc } from "./lib/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

export const syncUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Note: This could be protected by an internal webhook secret in production
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
      name: args.name,
      role: "user",
      onboardingStatus: "pending",
      affiliateStatus: "none",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
