import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';

let sqlInstance: any = null;
let neonDbInstance: NeonHttpDatabase<typeof schema> | null = null;

// Initialize database connection lazily to ensure .env is loaded
function initializeDatabase() {
  if (neonDbInstance && sqlInstance) {
    return { sql: sqlInstance, neonDb: neonDbInstance };
  }

  // Get connection string from environment
  const connectionString = process.env.DATABASE_URL || 
                          process.env.NEON_DATABASE_URL ||
                          process.env.VITE_NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Database URL environment variable is required');
    console.error('Available env vars:', {
      DATABASE_URL: process.env.DATABASE_URL,
      NEON_DATABASE_URL: process.env.NEON_DATABASE_URL,
      VITE_NEON_DATABASE_URL: process.env.VITE_NEON_DATABASE_URL
    });
    throw new Error('Database URL environment variable is required. Set DATABASE_URL or NEON_DATABASE_URL in .env');
  }

  console.log('✅ Database connection string configured from environment');

  // Create Neon SQL client with browser warning disabled
  sqlInstance = neon(connectionString, {
    disableWarningInBrowsers: true // Suppress security warning for development
  });

  // Create Drizzle database instance with proper typing
  neonDbInstance = drizzle(sqlInstance as any, { schema }) as NeonHttpDatabase<typeof schema>;

  return { sql: sqlInstance, neonDb: neonDbInstance };
}

// Lazy-loaded exports
export const sql = new Proxy({} as any, {
  get() {
    return initializeDatabase().sql;
  }
});

export const neonDb = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(target, prop) {
    const db = initializeDatabase().neonDb!;
    return (db as any)[prop];
  }
});

// Helper function to test Neon connection
export async function testNeonConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Neon database connected successfully');
    return { success: true, result };
  } catch (error) {
    console.error('❌ Neon database connection failed:', error);
    return { success: false, error };
  }
}