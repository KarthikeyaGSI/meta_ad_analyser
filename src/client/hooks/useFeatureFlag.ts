// convex import removed
// convex import removed
// convex import removed

/**
 * A hook to evaluate if a specific feature flag is enabled for the active organization.
 */
export function useFeatureFlag(organizationId: string | undefined, featureName: string) {
  const flags: any = {};

  if (!flags) {
    return false; // Loading or missing org defaults to false
  }

  const flag = flags.find(f => f.featureName === featureName);
  return flag?.enabled ?? false;
}
