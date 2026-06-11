// src/server/db/migrations/20240610_add_meta_columns.ts
import { sql } from 'drizzle-orm';

export const up = sql`
  ALTER TABLE organizations
    ADD COLUMN meta_access_token TEXT,
    ADD COLUMN meta_account_id TEXT;
`;

export const down = sql`
  ALTER TABLE organizations
    DROP COLUMN meta_access_token,
    DROP COLUMN meta_account_id;
`;
