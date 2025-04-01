import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'; // ListObjectsCommand
import nodemailer from 'nodemailer';

interface Row {
  [column: string]: string | number | boolean | null; 
}

// Database connection setup
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Function to send notification emails
async function sendNotification(subject: string, message: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject,
      text: message,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Function for performing the backup
export async function performBackup() {
  try {
    const tables = ['users', 'patients', 'audit_logs'];
    const backupData: { [key: string]: Row[] } = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table}`);
      backupData[table] = result.rows;
    }

    const timestamp = new Date().toISOString();
    const backupFileName = `backup_${timestamp}.json`;

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: backupFileName,
      Body: JSON.stringify(backupData),
      ContentType: 'application/json',
      ServerSideEncryption: 'AES256'
    }));

    await sendNotification(
      'Backup Successful',
      `Backup completed successfully. File: ${backupFileName}`
    );

    return { success: true, filename: backupFileName };
  } catch (error: unknown) {
    console.error('Error performing backup:', error);
    if(error instanceof Error) {
      await sendNotification(
        'Backup Failed',
        `Error occurred while performing backup: ${error.message}`
      );
      throw error;
    }
  }
}

// POST endpoint to trigger backup
export async function POST() {
  try {
    const result = await performBackup();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in backup endpoint:', error);
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