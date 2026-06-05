import { internalMutation, internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

const MAX_RETRIES = 3;

// ── PUBLIC: Trigger a sync job from the frontend ──────────────────────────────
export const triggerSync = mutation({
  args: {
    organizationId: v.id("organizations"),
    integrationId: v.id("integrations"),
    type: v.optional(v.union(v.literal("full"), v.literal("incremental"))),
  },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);

    // Prevent duplicate running jobs
    const running = await ctx.db
      .query("syncJobs")
      .withIndex("by_org_and_status", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "running")
      )
      .first();
    if (running) {
      throw new Error("A sync job is already running for this organization.");
    }

    await ctx.db.insert("syncJobs", {
      organizationId: args.organizationId,
      integrationId: args.integrationId,
      type: args.type ?? "incremental",
      status: "queued",
      retryCount: 0,
      maxRetries: MAX_RETRIES,
      createdAt: Date.now(),
    });
  },
});

// ── INTERNAL MUTATIONS ─────────────────────────────────────────────────────────

export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("syncJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("retrying")
    ),
    startedAt:    v.optional(v.number()),
    completedAt:  v.optional(v.number()),
    errorDetails: v.optional(v.string()),
    retryCount:   v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { jobId, status, ...rest } = args;
    const patch: Record<string, unknown> = { status };
    if (rest.startedAt    !== undefined) patch.startedAt    = rest.startedAt;
    if (rest.completedAt  !== undefined) patch.completedAt  = rest.completedAt;
    if (rest.errorDetails !== undefined) patch.errorDetails = rest.errorDetails;
    if (rest.retryCount   !== undefined) patch.retryCount   = rest.retryCount;
    await ctx.db.patch(jobId, patch);
  },
});

export const appendLog = internalMutation({
  args: {
    jobId:          v.id("syncJobs"),
    organizationId: v.id("organizations"),
    level:          v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message:        v.string(),
    metadata:       v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("syncLogs", {
      syncJobId:      args.jobId,
      organizationId: args.organizationId,
      level:          args.level,
      message:        args.message,
      metadata:       args.metadata,
      timestamp:      Date.now(),
    });
  },
});

export const markIntegrationSynced = internalMutation({
  args: { integrationId: v.id("integrations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.integrationId, {
      status:      "active",
      lastSyncedAt: Date.now(),
    });
  },
});

export const markIntegrationError = internalMutation({
  args: { integrationId: v.id("integrations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.integrationId, { status: "error" });
  },
});

// ── PUBLIC QUERIES ─────────────────────────────────────────────────────────────

export const getLatestSyncJob = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("syncJobs")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();
  },
});

export const getSyncLogs = query({
  args: { jobId: v.id("syncJobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncLogs")
      .withIndex("by_job", (q) => q.eq("syncJobId", args.jobId))
      .order("desc")
      .take(50);
  },
});

export const getRecentSyncJobs = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("syncJobs")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(10);
  },
});
