// src/server/db/migrations/20240610_add_meta_columns.ts
import { migration } from 'drizzle-orm/migration';
import { sql } from 'drizzle-orm';

export const up = migration(async (db) => {
  await db.execute(sql`
    ALTER TABLE organizations
    ADD COLUMN meta_access_token TEXT,
    ADD COLUMN meta_account_id TEXT;
  `);
});

export const down = migration(async (db) => {
  await db.execute(sql`
    ALTER TABLE organizations
    DROP COLUMN meta_access_token,
    DROP COLUMN meta_account_id;
  `);
});
