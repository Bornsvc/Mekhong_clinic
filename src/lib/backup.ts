import pool from '@/backend/config/database';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'; // ListObjectsCommand
import nodemailer from 'nodemailer';

interface Row {
  [column: string]: string | number | boolean | null; 
}

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

export async function sendNotification(subject: string, message: string) {
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