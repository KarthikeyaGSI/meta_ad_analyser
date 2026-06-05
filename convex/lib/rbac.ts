import { Doc } from "../_generated/dataModel";

export type Role = "owner" | "admin" | "manager" | "member" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 50,
  admin: 40,
  manager: 30,
  member: 20,
  viewer: 10,
};

/**
 * Checks if a membership role satisfies a minimum required role.
 */
export function hasRequiredRole(membership: Doc<"teamMembers">, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[membership.role as Role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Enforces a minimum role. Throws an error if the role is insufficient.
 */
export function enforceRole(membership: Doc<"teamMembers">, requiredRole: Role, actionDesc = "perform this action") {
  if (!hasRequiredRole(membership, requiredRole)) {
    throw new Error(`Permission denied: You must be an ${requiredRole} to ${actionDesc}.`);
  }
}
