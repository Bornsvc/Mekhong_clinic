import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const globalForPg = global as unknown as { pgPool: Pool };

// Initialize Pool instance with enhanced error handling
export const pool = 
globalForPg.pgPool ||
new Pool({
  user: process.env.POSTGRESUSER,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDB,
  password: process.env.POSTGRESPASSWORD,
  port: parseInt(process.env.POSTGRESPORT || '5432'),
  connectionString: process.env.POSTGRESURL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: true }  // Production ใช้การตรวจสอบ SSL
    : { rejectUnauthorized: false }, // Development ไม่ต้องการการตรวจสอบ SSL (หากใช้ Neon ควรตั้งเป็น false)
  
  // การตั้งค่า connection timeout และ idle timeout
  connectionTimeoutMillis: 5000,  // เวลาที่จะรอเชื่อมต่อก่อนจะเกิด timeout (ms)
  idleTimeoutMillis: 30000,       // เวลาที่เชื่อมต่อจะค้างไว้โดยไม่ทำการใดๆ (ms)
  max: 20,                        // จำนวน connection สูงสุดที่ Pool สามารถเปิดได้
  allowExitOnIdle: true           // เมื่อ pool ไม่มีการใช้งานอีกต่อไป, จะสามารถออกจากโปรแกรมได้
});
if (process.env.NODEENV !== 'production') globalForPg.pgPool = pool;

// Test the connection and verify plpgsql extension
pool.connect(async (err, client, release) => {
  if (err || !client) {
    console.error('Error acquiring client:', err?.stack);
    return;
  }

  try {
    // Install plpgsql extension if not exists
    await client.query('CREATE EXTENSION IF NOT EXISTS plpgsql');
    
    // Verify plpgsql extension
    const extensionResult = await client.query('SELECT * FROM pg_extension WHERE extname = \'plpgsql\'');
    if (extensionResult.rows.length === 0) {
      throw new Error('plpgsql extension installation failed');
    }
    
    // Test basic connection
    const result = await client.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database at:', result.rows[0].now);
    
    // Verify database version and settings
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL version:', versionResult.rows[0].version);
  } catch (error: unknown) {
    console.error('Database initialization error:', error);
    if (error instanceof Error) {
      if (error.message.includes('permission denied') || error.message.includes('plpgsql')) {
        console.error('Error installing plpgsql extension. Please contact database administrator to install it manually.');
      } else {
        console.error('Unexpected database error:', error.message);
      }
    }
  } finally {
    release();
  }
});


// export default pool;