import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';

// Neon database connection - use the primary DATABASE_URL which is now set to Neon
const connectionString = import.meta.env.VITE_DATABASE_URL || 
                        import.meta.env.VITE_NEON_DATABASE_URL || 
                        process.env.DATABASE_URL || 
                        process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.error('Available env vars:', {
    VITE_DATABASE_URL: import.meta.env.VITE_DATABASE_URL,
    VITE_NEON_DATABASE_URL: import.meta.env.VITE_NEON_DATABASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL
  });
  throw new Error('Database URL environment variable is required');
}

// Create Neon SQL client with browser warning disabled
export const sql = neon(connectionString, {
  disableWarningInBrowsers: true // Suppress security warning for development
});

// Create Drizzle database instance with proper typing
export const neonDb = drizzle(sql as any, { schema }) as NeonHttpDatabase<typeof schema>;

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