import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * A hook to evaluate if a specific feature flag is enabled for the active organization.
 */
export function useFeatureFlag(organizationId: Id<"organizations"> | undefined, featureName: string) {
  const flags = useQuery(
    api.flags.getFlags, 
    organizationId ? { organizationId } : "skip"
  );

  if (!flags) {
    return false; // Loading or missing org defaults to false
  }

  const flag = flags.find(f => f.featureName === featureName);
  return flag?.enabled ?? false;
}
