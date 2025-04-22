import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const globalForPg = global as unknown as { pgPool: Pool };

if (!process.env.POSTGRESURL) {
  throw new Error('❌ POSTGRESURL is not defined in .env file');
}
// ปรับปรุงการตั้งค่า Pool configuration
export const pool = 
globalForPg.pgPool ||
new Pool({
  connectionString: process.env.POSTGRESURL,
  ssl: { rejectUnauthorized: false }, // 🔒 ต้องเปิด SSL ตลอดสำหรับ Neon

  // 👇 เพิ่มการตั้งค่าเสถียร
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 60000,
  max: 30,
  min: 5,
  allowExitOnIdle: true,
  statement_timeout: 15000,
  query_timeout: 15000,
});

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;


// เพิ่มการจัดการ error events
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// ปรับปรุงการทดสอบการเชื่อมต่อ
(async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS plpgsql');

    const [extensionResult, versionResult, connectionTest] = await Promise.all([
      pool.query(`SELECT * FROM pg_extension WHERE extname = 'plpgsql'`),
      pool.query('SELECT version()'),
      pool.query('SELECT NOW()')
    ]);

    if (extensionResult.rows.length === 0) {
      throw new Error('plpgsql extension installation failed');
    }

    console.log("--------------------------------------------------------");
    console.log('✅ Database Connected!');
    console.log('- Connected at:', connectionTest.rows[0].now);
    console.log('- PostgreSQL version:', versionResult.rows[0].version);
    console.log('- Pool configuration:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });
    console.log("--------------------------------------------------------");

  } catch (error: unknown) {
    console.error('❌ Database initialization error:', error);
    if (error instanceof Error) {
      console.error('Detailed error:', error.message);
    }
    process.exit(-1);
  }
})();

export default pool;