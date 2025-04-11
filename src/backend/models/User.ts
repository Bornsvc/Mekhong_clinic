import { Pool } from 'pg';
import bcrypt from 'bcryptjs';


interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

class UserModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  

  async updatePassword(username: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const query = 'UPDATE users SET password = $1 WHERE username = $2';
      const result = await this.pool.query(query, [hashedPassword, username]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error updating password - -:', error);
      return false;
    }
  }
  async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
  
    const result = await this.pool.query(query, [username]);
    return result.rows[0] || null;
  }

  async validatePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    // console.log("Input password:", inputPassword);
    // console.log("Hashed password:", hashedPassword);
    const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
    // console.log("Password match result:", isMatch);
    return isMatch;
  }
  

  async createUser(username: string, password: string, role: string = 'user'): Promise<User> {
    // แฮชรหัสผ่านก่อนเก็บในฐานข้อมูล
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // คำสั่ง SQL เพื่อแทรกข้อมูลผู้ใช้
    const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *';
    const result = await this.pool.query(query, [username, hashedPassword, role]);
    
    // ส่งกลับข้อมูลผู้ใช้ที่ถูกสร้าง
    return result.rows[0];
  }
  
}

export default UserModel;