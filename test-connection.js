import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('Testing connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Server time:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err.message);
    
    // Try with SSL
    console.log('\nTrying with SSL...');
    const sslPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      const client = await sslPool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ SSL Connection successful!');
      console.log('Server time:', result.rows[0].now);
      client.release();
    } catch (sslErr) {
      console.error('❌ SSL Connection also failed:');
      console.error(sslErr.message);
    } finally {
      await sslPool.end();
    }
  } finally {
    await pool.end();
  }
}

testConnection();