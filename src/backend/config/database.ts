import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const globalForPg = global as unknown as { pgPool: Pool };

// ปรับปรุงการตั้งค่า Pool configuration
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
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  
  // เพิ่มและปรับแต่งค่า timeout และ connection limits
  connectionTimeoutMillis: 10000,    // เพิ่มเวลารอการเชื่อมต่อเป็น 10 วินาที
  idleTimeoutMillis: 60000,          // เพิ่มเวลา idle timeout เป็น 1 นาที
  max: 30,                           // เพิ่มจำนวน connection สูงสุด
  min: 5,                            // กำหนดจำนวน connection ขั้นต่ำ
  allowExitOnIdle: true,
  statement_timeout: 15000,          // timeout สำหรับ query (15 วินาที)
  query_timeout: 15000               // timeout สำหรับ query execution
});

if (process.env.NODEENV !== 'production') globalForPg.pgPool = pool;

// เพิ่มการจัดการ error events
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// ปรับปรุงการทดสอบการเชื่อมต่อ
pool.connect(async (err, client, release) => {
  if (err || !client) {
    console.error('Error acquiring client:', err?.stack);
    process.exit(-1);
    return;
  }

  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS plpgsql');
    
    const [extensionResult, versionResult, connectionTest] = await Promise.all([
      client.query('SELECT * FROM pg_extension WHERE extname = \'plpgsql\''),
      client.query('SELECT version()'),
      client.query('SELECT NOW()')
    ]);

    if (extensionResult.rows.length === 0) {
      throw new Error('plpgsql extension installation failed');
    }

    console.log('Database Connection Status:');
    console.log('- Connected at:', connectionTest.rows[0].now);
    console.log('- PostgreSQL version:', versionResult.rows[0].version);
    console.log('- Pool configuration:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });

  } catch (error: unknown) {
    console.error('Database initialization error:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', error.message);
    }
    process.exit(-1);
  } finally {
    release();
  }
});

export default pool;