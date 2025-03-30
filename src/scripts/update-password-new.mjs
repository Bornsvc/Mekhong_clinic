import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  user: 'born',
  host: 'localhost',
  database: 'mekong_clinic',
  port: 5432
});

async function updatePassword() {
  try {
    const hashedPassword = await bcrypt.hash('12345Svc', 10);
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