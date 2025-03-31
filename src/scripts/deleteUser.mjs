import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'born',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'mekong_clinic',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function deleteUser(username) {
  try {
    const query = `
      DELETE FROM users
      WHERE username = $1
      RETURNING id, username, role, email
    `;
    
    const result = await pool.query(query, [username]);
    
    if (result.rows.length === 0) {
      console.log('ไม่พบผู้ใช้ที่ต้องการลบ');
      return;
    }
    
    console.log('ลบผู้ใช้สำเร็จ:', result.rows[0]);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

const username = process.argv[2];

if (!username) {
  console.log('กรุณาระบุ username ที่ต้องการลบ');
  console.log('วิธีใช้: node deleteUser.mjs <username>');
  process.exit(1);
}

deleteUser(username);