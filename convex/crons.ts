import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Weekly analytics summaries — fires every Monday at 08:00 UTC
crons.weekly(
  "weekly-summary-report",
  { dayOfWeek: "monday", hourUTC: 8, minuteUTC: 0 },
  internal.analytics.generateWeeklySummaries
);

// Daily billing/trial expiration checks — fires at 00:01 UTC
crons.daily(
  "check-trial-expirations",
  { hourUTC: 0, minuteUTC: 1 },
  internal.billing.checkTrialExpirations
);

export default crons;
