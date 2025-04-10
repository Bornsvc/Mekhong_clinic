import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Initialize Pool instance
const pool = new Pool({
  user: process.env.POSTGRESUSER,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDB,
  password: process.env.POSTGRESPASSWORD,
  port: parseInt(process.env.POSTGRESPORT || '5432'),
  connectionString: process.env.POSTGRESURL,
  // ssl: {
  //   rejectUnauthorized: false // เปิดใช้งาน SSL และยอมรับการเชื่อมต่อที่ไม่ถูกต้อง
  // }
});

// Test the connection
pool.connect((err, client, release) => {
  if (err || !client) {
    console.error('Error acquiring client:', err?.stack);
    return;
  }

  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Error executing query:', err.stack);
      return;
    }
    console.log('Connected to PostgreSQL database at:', result.rows[0].now);
  });
});


export default pool;