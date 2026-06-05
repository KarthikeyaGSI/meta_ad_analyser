import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // External Auth ID (Clerk)
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")), // Convex storage ID
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("user")), // Global system role
    onboardingStatus: v.union(v.literal("pending"), v.literal("completed")),
    referralCode: v.optional(v.string()),
    affiliateStatus: v.union(v.literal("none"), v.literal("active"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_referral_code", ["referralCode"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.id("_storage")), // Convex storage ID
    favicon: v.optional(v.id("_storage")),
    customDomain: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    supportEmail: v.optional(v.string()),
    whiteLabelEnabled: v.boolean(),
    ownerId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("starter"), v.literal("growth"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("deleted")),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  workspaces: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  teamMembers: defineTable({
    organizationId: v.id("organizations"),
    workspaceId: v.optional(v.id("workspaces")), // Optional: if null, applies to entire org
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("manager"), v.literal("member"), v.literal("viewer")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_org", ["organizationId"])
    .index("by_org_and_user", ["organizationId", "userId"]),

  subscriptions: defineTable({
    organizationId: v.id("organizations"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    plan: v.string(),
    billingCycle: v.union(v.literal("monthly"), v.literal("annual")),
    status: v.union(v.literal("active"), v.literal("past_due"), v.literal("canceled"), v.literal("trialing")),
    renewalDate: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"])
    .index("by_subscription", ["stripeSubscriptionId"]),

  usageTracking: defineTable({
    organizationId: v.id("organizations"),
    apiCalls: v.number(),
    aiCredits: v.number(),
    reportsGenerated: v.number(),
    storageUsed: v.number(),
    monthlyUsage: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"]),

  featureFlags: defineTable({
    organizationId: v.id("organizations"),
    featureName: v.string(),
    enabled: v.boolean(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_and_feature", ["organizationId", "featureName"]),

  apiKeys: defineTable({
    organizationId: v.id("organizations"),
    keyHash: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    lastUsed: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_org", ["organizationId"]),

  webhooks: defineTable({
    organizationId: v.id("organizations"),
    endpoint: v.string(),
    secret: v.string(),
    enabled: v.boolean(),
    events: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_org", ["organizationId"]),

  referrals: defineTable({
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("completed")),
    rewardAmount: v.number(),
    createdAt: v.number(),
  }).index("by_referrer", ["referrerId"]),

  affiliates: defineTable({
    userId: v.id("users"),
    commissionRate: v.number(),
    earnings: v.number(),
    payouts: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  supportTickets: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    subject: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"), v.literal("closed")),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  auditLogs: defineTable({
    actorId: v.id("users"),
    organizationId: v.id("organizations"),
    action: v.string(),
    entity: v.string(),
    metadata: v.optional(v.any()), // Contextual data
    timestamp: v.number(),
  }).index("by_org", ["organizationId"])
    .index("by_actor", ["actorId"]),

  premiumRequests: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    name: v.string(),
    email: v.string(),
    company: v.string(),
    website: v.string(),
    teamSize: v.string(),
    requirements: v.string(),
    status: v.union(v.literal("pending"), v.literal("contacted"), v.literal("qualified"), v.literal("converted"), v.literal("closed")),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"]),

  integrations: defineTable({
    organizationId: v.id("organizations"),
    provider: v.union(v.literal("meta"), v.literal("google"), v.literal("tiktok")),
    accountId: v.string(),
    accessToken: v.string(),
    customName: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("error"), v.literal("disconnected")),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_org", ["organizationId"])
    .index("by_provider", ["provider"]),
});
