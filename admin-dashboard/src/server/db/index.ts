import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// The admin dashboard connects to the exact same Neon DB instance
const sql = neon(process.env.DATABASE_URL || "postgresql://dummy:dummy@dummy.com/dummy");
export const db = drizzle(sql, { schema });
