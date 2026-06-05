import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { requireUser, requireUserDoc } from "./auth";

/**
 * Validates that the current authenticated user belongs to the specified organization.
 * Returns the user document and their team membership record.
 */
export async function requireTenantAccess(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">
) {
  const { userId } = await requireUser(ctx);
  const user = await requireUserDoc(ctx, userId);

  const membership = await ctx.db
    .query("teamMembers")
    .withIndex("by_org_and_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", user._id)
    )
    .unique();

  if (!membership) {
    throw new Error("Unauthorized: You do not have access to this organization.");
  }

  // Also verify the organization is active
  const org = await ctx.db.get(organizationId);
  if (!org || org.status === "deleted") {
    throw new Error("Organization not found or deleted.");
  }
  if (org.status === "suspended") {
    throw new Error("Organization is currently suspended.");
  }

  return { user, membership, organization: org };
}
