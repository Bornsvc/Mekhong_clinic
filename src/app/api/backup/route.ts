import { NextResponse } from 'next/server';
import pool from '@/backend/config/database';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // ListObjectsCommand
import { performBackup, sendNotification } from '@/lib/backup';


interface Row {
  [column: string]: string | number | boolean | null; 
}

// Database connection setup
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

// S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});



// POST endpoint to trigger backup
export async function POST() {
  try {
    const result = await performBackup();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in backup endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to perform backup' },
      { status: 500 }
    );
  }
}

// GET endpoint to check backup status
export async function GET() {
  try {
    return NextResponse.json({ status: 'Backup endpoint is ready' });
  } catch (error) {
    console.error('Error checking backup status:', error);
    return NextResponse.json(
      { error: 'Failed to check backup status' },
      { status: 500 }
    );
  }
}

// PUT endpoint to restore from backup
export async function PUT(request: Request) {
  try {
    const { backupKey } = await request.json();
    
    // Get backup data from S3
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: backupKey
    }));

    const backupData = JSON.parse(await response.Body?.transformToString() || '{}');

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Restore data for each table
      for (const [table, data] of Object.entries(backupData)) {
        // Clear existing data
        await client.query(`TRUNCATE TABLE ${table} CASCADE`);

        // Insert backup data
        for (const row of data as Row[]) {
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
      await sendNotification(
        'Restore Successful',
        `Data restored successfully from backup: ${backupKey}`
      );
      return NextResponse.json({ success: true, message: 'Data restored successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}