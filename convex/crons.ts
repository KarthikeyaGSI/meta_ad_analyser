import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Weekly summary report for active workspaces
crons.weekly(
  "weekly-summary-report",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.analytics.generateWeeklySummaries // Assuming this exists or will exist
);

// Daily check for trial expirations
crons.daily(
  "check-trial-expirations",
  { hourUTC: 0, minuteUTC: 1 },
  internal.billing.checkTrialExpirations // Assuming this exists
);

export default crons;
