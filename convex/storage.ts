import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";
import { enforceRole } from "./lib/rbac";

export const generateUploadUrl = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Only admins or owners can generate upload URLs for organization assets
    const { membership } = await requireTenantAccess(ctx, args.organizationId);
    enforceRole(membership, "admin", "upload organization assets");

    // Return an upload URL securely provided by Convex
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { 
    organizationId: v.id("organizations"),
    storageId: v.id("_storage") 
  },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.storage.getUrl(args.storageId);
  },
});
