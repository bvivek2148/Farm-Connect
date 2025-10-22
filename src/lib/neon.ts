import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';

let neonDbInstance: NeonHttpDatabase<typeof schema> | null = null;

function getDatabase() {
  if (neonDbInstance) {
    return neonDbInstance;
  }

  const connectionString = process.env.DATABASE_URL || 
                          process.env.NEON_DATABASE_URL ||
                          process.env.VITE_NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }

  console.log('✅ Database connection configured');
  
  // Create Neon SQL client and pass to Drizzle
  const sql = neon(connectionString, {
    disableWarningInBrowsers: true,
    fullResults: true
  });
  
  // For Drizzle 0.29.5, pass the sql function directly
  neonDbInstance = drizzle(sql as any, { schema }) as NeonHttpDatabase<typeof schema>;
  return neonDbInstance;
}

export const neonDb = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get: (_target, prop) => {
    const db = getDatabase();
    const value = (db as any)[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
});
