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
  connectionString: process.env.POSTGRESURL,
  ssl: {
    rejectUnauthorized: false // เปิดใช้งาน SSL และยอมรับการเชื่อมต่อที่ไม่ถูกต้อง
  }
});

async function createUser(username, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `${username}@mekong-clinic.com`;
    // const expiryDate = new Date();
    // expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Set expiry to 1 year from creation
    
    const query = `
      INSERT INTO users (username, password, role, email, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, role, email, expires_at
    `;
    
    const result = await pool.query(query, [username, hashedPassword, role, email, expiryDate]);
    console.log('complete create User:', result.rows[0]);
    // console.log('Account expires on:', expiryDate.toLocaleDateString());
  } catch (error) {
    console.error('Something went wrong:', error);
  } finally {
    await pool.end();
  }
}

// รับค่าจาก command line arguments
const username = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'user'; // ถ้าไม่ระบุ role จะเป็น 'user' โดยอัตโนมัติ

if (!username || !password) {
  console.log('pls provide username and password');
  console.log('วิธีใช้: node createUser.mjs <username> <password> [role]');
  process.exit(1);
}

createUser(username, password, role);