import { MetaUser, MetaAdAccount } from '../shared/dto/meta';

export interface MetaAuthResponse {
  success: boolean;
  token?: string | null;
  user?: MetaUser | null;
  accounts?: MetaAdAccount[] | null;
  adAccountConnected?: boolean | null;
  status?: "connected" | "disconnected" | "syncing" | "failed";
  error?: string | null;
  insightsWorking?: boolean | null;
  campaignCount?: number | null;
  hasSpendData?: boolean | null;
}
