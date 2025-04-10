import { Pool } from 'pg';

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

export default pool;