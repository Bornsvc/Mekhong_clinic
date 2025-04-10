import { Pool } from 'pg';

export async function testDatabaseConnection(pool: Pool): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('เชื่อมต่อกับฐานข้อมูล PostgreSQL สำเร็จ เวลาปัจจุบัน:', result.rows[0].now);
      
      // ทดสอบการสร้างตารางพื้นฐาน
      await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `);
      console.log('ตรวจสอบโครงสร้างฐานข้อมูลสำเร็จ');
      
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
    throw new Error('การเชื่อมต่อฐานข้อมูลล้มเหลว');
  }
}

export async function checkDatabaseHealth(pool: Pool): Promise<{
  isConnected: boolean;
  message: string;
}> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return {
        isConnected: true,
        message: 'ฐานข้อมูลทำงานปกติ'
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.log(err)
    return {
      isConnected: false,
      message: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้'
    };
  }
}