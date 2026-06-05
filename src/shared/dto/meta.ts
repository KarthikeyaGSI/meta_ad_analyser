// src/shared/dto/meta.ts
export interface MetaUser {
  id: string;
  name: string;
  email?: string;
  [key: string]: unknown;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  actId: string;
  [key: string]: unknown;
}

export interface MetaAuthResponse {
  success: boolean;
  token: string | null;
  user: MetaUser | null;
  accounts: MetaAdAccount[];
  adAccountConnected: boolean;
  status: "connected" | "disconnected" | "syncing" | "failed";
  error: string | null;
  insightsWorking?: boolean | null;
  campaignCount?: number | null;
  hasSpendData?: boolean | null;
}
