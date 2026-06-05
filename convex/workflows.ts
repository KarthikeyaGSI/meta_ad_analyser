import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWorkflows = query({
  args: { organizationId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();
  },
});

export const saveWorkflow = mutation({
  args: {
    id: v.optional(v.id("workflows")),
    organizationId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    nodes: v.any(),
    edges: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      // Update existing
      await ctx.db.patch(args.id, {
        name: args.name,
        description: args.description,
        nodes: args.nodes,
        edges: args.edges,
        status: args.status,
        updatedAt: Date.now(),
      });
      return args.id;
    } else {
      // Create new
      return await ctx.db.insert("workflows", {
        organizationId: args.organizationId,
        name: args.name,
        description: args.description,
        nodes: args.nodes,
        edges: args.edges,
        status: args.status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
