export interface MetaAuthResponse {
  success: boolean;
  token?: string | null;
  user?: any | null;
  accounts?: any[] | null;
  adAccountConnected?: boolean | null;
  status?: "connected" | "disconnected" | "syncing" | "failed";
  error?: string | null;
  insightsWorking?: boolean | null;
  campaignCount?: number | null;
  hasSpendData?: boolean | null;
}
