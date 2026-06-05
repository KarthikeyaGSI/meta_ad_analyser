import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

// List webhooks
export const getWebhooks = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("webhooks")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

// Create webhook
export const createWebhook = mutation({
  args: {
    organizationId: v.id("organizations"),
    endpoint: v.string(),
    events: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a random webhook secret
    const secret = "whsec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    return await ctx.db.insert("webhooks", {
      organizationId: args.organizationId,
      endpoint: args.endpoint,
      secret,
      enabled: true,
      events: args.events,
      createdAt: Date.now(),
    });
  },
});

// Delete webhook
export const deleteWebhook = mutation({
  args: {
    webhookId: v.id("webhooks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.webhookId);
  },
});

// Internal function to trigger outbound webhook
export const triggerWebhook = mutation({
  args: {
    organizationId: v.id("organizations"),
    event: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    // Note: In real Convex, we would use an Action or internalAction for external HTTP requests
    // since mutations can't fetch. We simulate it here by logging.
    const webhooks = await ctx.db
      .query("webhooks")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();

    const matchingWebhooks = webhooks.filter(w => w.events.includes(args.event) || w.events.includes("*"));

    if (matchingWebhooks.length > 0) {
      console.log(`[Webhook Engine] Triggering ${matchingWebhooks.length} webhooks for event ${args.event}`);
      // Send logic would go to an action
    }
  },
});
