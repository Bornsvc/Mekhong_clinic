import { Pool } from 'pg';

const pool = new Pool({
  user: 'admin',
  password: '12345Svc', 
  host: 'localhost',
  port: 5432,
  database: 'mekong_clinic'
});

export default pool;