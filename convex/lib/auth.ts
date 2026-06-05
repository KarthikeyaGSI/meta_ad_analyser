import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function requireUser(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<{ userId: string }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please log in.");
  }
  // We assume identity.subject contains the Clerk/External Auth ID.
  return { userId: identity.subject };
}

export async function requireUserDoc(ctx: QueryCtx | MutationCtx, externalUserId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", externalUserId))
    .unique();
    
  if (!user) {
    throw new Error("User record not found in the database.");
  }
  
  return user;
}
