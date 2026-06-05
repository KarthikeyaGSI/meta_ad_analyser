import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTenantAccess } from "./lib/tenant";

// ── INTERNAL MUTATIONS ─────────────────────────────────────────────────────────

export const createAuditRun = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    integrationId:  v.id("integrations"),
    triggeredBy:    v.union(v.literal("user"), v.literal("cron"), v.literal("sync")),
  },
  handler: async (ctx, args) => {
    const lastMetric = await ctx.db
      .query("healthMetrics")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();

    return await ctx.db.insert("auditRuns", {
      organizationId:    args.organizationId,
      integrationId:     args.integrationId,
      triggeredBy:       args.triggeredBy,
      status:            "running",
      healthScoreBefore: lastMetric?.healthScore,
      findingsCount:     0,
      startedAt:         Date.now(),
    });
  },
});

export const saveHealthMetrics = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    integrationId:  v.id("integrations"),
    healthScore:    v.number(),
    spendAtRisk:    v.number(),
    criticalIssues: v.number(),
    warnings:       v.number(),
    opportunities:  v.number(),
    issues: v.array(v.object({
      type:                v.string(),
      severity:            v.union(v.literal("critical"), v.literal("warning"), v.literal("opportunity")),
      title:               v.string(),
      description:         v.string(),
      estimatedImpact:     v.string(),
      recommendedAction:   v.string(),
      affectedEntityId:    v.optional(v.string()),
      affectedEntityName:  v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("healthMetrics", {
      ...args,
      computedAt: Date.now(),
    });
  },
});

export const completeAuditRun = internalMutation({
  args: {
    auditRunId:    v.id("auditRuns"),
    healthScore:   v.number(),
    findingsCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.auditRunId, {
      status:           "completed",
      healthScoreAfter: args.healthScore,
      findingsCount:    args.findingsCount,
      completedAt:      Date.now(),
    });
  },
});

export const failAuditRun = internalMutation({
  args: {
    auditRunId:   v.id("auditRuns"),
    errorDetails: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.auditRunId, {
      status:       "failed",
      errorDetails: args.errorDetails,
      completedAt:  Date.now(),
    });
  },
});

// ── PUBLIC MUTATION: Trigger audit manually ───────────────────────────────────

export const triggerAudit = mutation({
  args: {
    organizationId: v.id("organizations"),
    integrationId:  v.id("integrations"),
  },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);

    const lastMetric = await ctx.db
      .query("healthMetrics")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();

    const auditRunId = await ctx.db.insert("auditRuns", {
      organizationId:    args.organizationId,
      integrationId:     args.integrationId,
      triggeredBy:       "user",
      status:            "running",
      healthScoreBefore: lastMetric?.healthScore,
      findingsCount:     0,
      startedAt:         Date.now(),
    });

    // Compute health score synchronously (rules engine will live here in production)
    const issues: Array<{
      type: string;
      severity: "critical" | "warning" | "opportunity";
      title: string;
      description: string;
      estimatedImpact: string;
      recommendedAction: string;
      affectedEntityId?: string;
      affectedEntityName?: string;
    }> = [];

    let healthScore = 100 - issues.filter(i => i.severity === "critical").length * 15
                         - issues.filter(i => i.severity === "warning").length  * 5;
    healthScore = Math.max(0, Math.min(100, healthScore));

    await ctx.db.insert("healthMetrics", {
      organizationId: args.organizationId,
      integrationId:  args.integrationId,
      healthScore,
      spendAtRisk:    0,
      criticalIssues: issues.filter(i => i.severity === "critical").length,
      warnings:       issues.filter(i => i.severity === "warning").length,
      opportunities:  issues.filter(i => i.severity === "opportunity").length,
      issues,
      computedAt:     Date.now(),
    });

    await ctx.db.patch(auditRunId, {
      status:           "completed",
      healthScoreAfter: healthScore,
      findingsCount:    issues.length,
      completedAt:      Date.now(),
    });

    return { auditRunId, healthScore };
  },
});

// ── PUBLIC QUERIES ─────────────────────────────────────────────────────────────

export const getLatestHealthMetrics = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("healthMetrics")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .first();
  },
});

export const getAuditHistory = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireTenantAccess(ctx, args.organizationId);
    return await ctx.db
      .query("auditRuns")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(20);
  },
});
