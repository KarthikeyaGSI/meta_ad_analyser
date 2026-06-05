import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireUserDoc } from "./lib/auth";

// A secure internal helper to verify system admins
async function enforceSystemAdmin(ctx: any) {
  const { userId } = await requireUser(ctx);
  const user = await requireUserDoc(ctx, userId);
  
  // Hardcoded or specifically flagged system admins
  if (user.role !== "admin") {
    throw new Error("Unauthorized: System administrator access required.");
  }
  return user;
}

export const getAllOrganizations = query({
  args: {},
  handler: async (ctx) => {
    await enforceSystemAdmin(ctx);
    return await ctx.db.query("organizations").order("desc").collect();
  },
});

export const getAllPremiumRequests = query({
  args: {},
  handler: async (ctx) => {
    await enforceSystemAdmin(ctx);
    return await ctx.db.query("premiumRequests").order("desc").collect();
  },
});

export const updatePremiumRequestStatus = mutation({
  args: {
    requestId: v.id("premiumRequests"),
    status: v.union(v.literal("pending"), v.literal("contacted"), v.literal("qualified"), v.literal("converted"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await enforceSystemAdmin(ctx);
    await ctx.db.patch(args.requestId, { status: args.status });
  },
});
