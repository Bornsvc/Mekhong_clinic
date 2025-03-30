import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mekhong_clinic',
  password: 'admin',
  port: 5432
});

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'Bornsvc']
    );
    console.log('Password update result:', result.rowCount > 0 ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updatePassword();