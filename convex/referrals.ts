import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireUserDoc } from "./lib/auth";

export const getMyReferrals = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const user = await requireUserDoc(ctx, userId);

    return await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerId", user._id))
      .collect();
  },
});

export const getMyCode = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const user = await requireUserDoc(ctx, userId);

    return user.referralCode;
  },
});

export const generateCode = mutation({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const user = await requireUserDoc(ctx, userId);

    if (user.referralCode) {
      return user.referralCode;
    }

    // Simple code generator
    const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    await ctx.db.patch(user._id, {
      referralCode: code,
      updatedAt: Date.now(),
    });

    return code;
  },
});
