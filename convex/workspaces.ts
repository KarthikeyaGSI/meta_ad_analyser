import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";
import { enforceRole } from "./lib/rbac";
import { requireUser, requireUserDoc } from "./lib/auth";

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Basic tenant boundary check
    await requireTenantAccess(ctx, args.organizationId);

    return await ctx.db
      .query("workspaces")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership, user } = await requireTenantAccess(ctx, args.organizationId);
    enforceRole(membership, "admin", "create a workspace");

    const workspaceId = await ctx.db.insert("workspaces", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      createdBy: user._id,
      createdAt: Date.now(),
    });

    // Automatically make the creator a manager of this workspace
    await ctx.db.insert("teamMembers", {
      organizationId: args.organizationId,
      workspaceId,
      userId: user._id,
      role: "manager",
      createdAt: Date.now(),
    });

    return workspaceId;
  },
});
