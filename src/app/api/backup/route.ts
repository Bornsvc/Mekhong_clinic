import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { S3Client, PutObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
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
    console.log(error)
    return NextResponse.json(
      { error: 'Failed to perform backup' },
      { status: 500 }
    );
  }
}

// GET endpoint to list backup files from S3
export async function GET() {
  try {
    const listObjectsCommand = {
      Bucket: process.env.AWS_S3_BUCKET || ''
    };

    const data = await s3Client.send(new ListObjectsCommand(listObjectsCommand));
    const backups = data.Contents?.map(item => ({
      key: item.Key,
      lastModified: item.LastModified,
      size: item.Size
    })) || [];

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}
