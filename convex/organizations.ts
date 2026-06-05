import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";
import { enforceRole } from "./lib/rbac";
import { requireUserDoc, requireUser } from "./lib/auth";

export const get = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const { organization } = await requireTenantAccess(ctx, args.organizationId);
    return organization;
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const user = await requireUserDoc(ctx, userId);
    
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
      
    const orgs = await Promise.all(
      memberships.map((m) => ctx.db.get(m.organizationId))
    );
    
    // Filter out nulls and deleted orgs
    return orgs.filter(o => o && o.status !== "deleted");
  },
});

export const create = mutation({
  args: { name: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const user = await requireUserDoc(ctx, userId);

    // Check slug uniqueness
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
      
    if (existing) throw new Error("Slug is already taken.");

    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: user._id,
      plan: "free",
      status: "active",
      whiteLabelEnabled: false,
      createdAt: Date.now(),
    });

    // Create the team member record as owner
    await ctx.db.insert("teamMembers", {
      organizationId: orgId,
      userId: user._id,
      role: "owner",
      createdAt: Date.now(),
    });

    return orgId;
  },
});

export const update = mutation({
  args: { 
    organizationId: v.id("organizations"), 
    name: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),
    faviconId: v.optional(v.id("_storage")),
    brandColor: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    alertPreferences: v.optional(v.object({
      slack: v.union(v.literal("all"), v.literal("critical"), v.literal("none")),
      whatsapp: v.union(v.literal("all"), v.literal("critical"), v.literal("none")),
    }))
  },
  handler: async (ctx, args) => {
    const { membership, organization } = await requireTenantAccess(ctx, args.organizationId);
    enforceRole(membership, "admin", "update organization settings");

    await ctx.db.patch(organization._id, {
      name: args.name ?? organization.name,
      customDomain: args.customDomain ?? organization.customDomain,
      logo: args.logoId ?? organization.logo,
      favicon: args.faviconId ?? organization.favicon,
      brandColor: args.brandColor ?? organization.brandColor,
      supportEmail: args.supportEmail ?? organization.supportEmail,
      alertPreferences: args.alertPreferences ?? organization.alertPreferences,
    });
  },
});
