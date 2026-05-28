// src/shared/dto/meta.ts
export interface MetaAuthResponse {
  success: boolean;
  token: string | null;
  user: Record<string, any> | null;
  accounts: Array<Record<string, any>>;
  adAccountConnected: boolean;
  status: "connected" | "disconnected" | "syncing" | "failed";
  error: string | null;
  insightsWorking?: boolean | null;
  campaignCount?: number | null;
  hasSpendData?: boolean | null;
}
