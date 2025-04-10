import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import pool from '@/backend/config/database';
import { RETENTION_POLICY } from './config';
// import { error } from 'console';

interface Row {
  [key: string]: string | number | boolean; // หรือระบุประเภทที่เหมาะสม
}

interface BackupData {
  [tableName: string]: Row[];  // กำหนดว่าแต่ละตารางมีข้อมูลเป็น array ของ Row
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// const pool = new Pool({
//   user: process.env.POSTGRES_USER,
//   host: process.env.POSTGRES_HOST,
//   database: process.env.POSTGRES_DB,
//   password: process.env.POSTGRES_PASSWORD,
//   port: parseInt(process.env.POSTGRES_PORT || '5432'),
//   ssl: {
//     rejectUnauthorized: false // เปิดใช้งาน SSL และยอมรับการเชื่อมต่อที่ไม่ถูกต้อง
//   }
// });

// ฟังก์ชันสำหรับลบไฟล์สำรองข้อมูลที่เก่าเกินกำหนด
export async function cleanupOldBackups(backups: { key: string, lastModified: Date }[]) {
  try {
    // เรียงลำดับไฟล์ตามวันที่
    const sortedBackups = backups.sort((a, b) => 
      b.lastModified.getTime() - a.lastModified.getTime()
    );

    // เก็บไฟล์ล่าสุดตามจำนวนที่กำหนด
    const backupsToKeep = sortedBackups.slice(0, RETENTION_POLICY.maxBackups);
    const backupsToDelete = sortedBackups.slice(RETENTION_POLICY.maxBackups);

    // ลบไฟล์ที่เกินกำหนด
    for (const backup of backupsToDelete) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || '',
        Key: backup.key
      }));
    }

    return {
      deletedCount: backupsToDelete.length,
      remainingCount: backupsToKeep.length
    };
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
    throw error;
  }
}

// ฟังก์ชันสำหรับกู้คืนข้อมูลจากไฟล์สำรอง
export async function restoreFromBackup(backupKey: string) {
  try {
    // ดึงข้อมูลจาก S3
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: backupKey
    }));

    const responseBody = await response.Body?.transformToString();
    if (!responseBody) {
      throw new Error('Failed to retrieve backup data from S3.');
    }

    let backupData: BackupData;
    try {
      backupData = JSON.parse(responseBody);
    } catch (parseError: unknown) {
      if (parseError instanceof Error) {
        throw new Error('Failed to parse backup data: ' + parseError.message);
      } else {
        throw new Error('Failed to parse backup data: Unknown error');
      }
    }

    if (Object.keys(backupData).length === 0) {
      throw new Error('Backup data is empty or corrupted');
    }

    // เริ่ม transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // กู้คืนข้อมูลแต่ละตาราง
      for (const [table, data] of Object.entries(backupData)) {
        // ลบข้อมูลเดิม
        await client.query(`TRUNCATE TABLE ${table} CASCADE`);

        // เพิ่มข้อมูลใหม่
        for (const row of data) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

          await client.query(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      }

      await client.query('COMMIT');
      return { success: true, message: 'Data restored successfully' };
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error){
        throw new Error('Failed to parse backup data: ' + error.message);
      }else {
        throw new Error('Failed to parse backup data: Unknown error');
      }
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Error restoring from backup:', error);
    if(error instanceof Error){
      throw new Error(`Backup restoration process failed: ${error.message}`);
    }
  }
}
