import pg from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
// import { fileURLToPath } from 'url';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'born',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'mekong_clinic',
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function createUser(username, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, role, email)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, role, email
    `;
    
    // const email = `${username}@mekong-clinic.com`; // สร้าง email อัตโนมัติ
    const result = await pool.query(query, [username, hashedPassword, role, email]);
    console.log('สร้างผู้ใช้สำเร็จ:', result.rows[0]);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await pool.end();
  }
}

// รับค่าจาก command line arguments
const username = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'user'; // ถ้าไม่ระบุ role จะเป็น 'user' โดยอัตโนมัติ

if (!username || !password) {
  console.log('กรุณาระบุ username และ password');
  console.log('วิธีใช้: node createUser.mjs <username> <password> [role]');
  process.exit(1);
}

createUser(username, password, role);