import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// The admin dashboard connects to the exact same Neon DB instance
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
