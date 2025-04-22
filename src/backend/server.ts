import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { testDatabaseConnection, checkDatabaseHealth } from './utils/databaseUtils';
import dotenv from 'dotenv';
import path from 'path';


// Configure static file serving
const publicPath = path.join(__dirname, '../../public');


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));


const pool = new Pool({
  connectionString: process.env.POSTGRESURL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

// ทดสอบการเชื่อมต่อฐานข้อมูลเมื่อเริ่มต้นเซิร์ฟเวอร์
testDatabaseConnection(pool).catch(err => {
  console.error('ไม่สามารถเชื่อมต่อกับฐานข้อมูลในครั้งแรกได้:', err);
  process.exit(1);
});

// ตรวจสอบสถานะฐานข้อมูลทุก 5 นาที
setInterval(async () => {
  const health = await checkDatabaseHealth(pool);
  if (!health.isConnected) {
    console.error('การตรวจสอบสถานะฐานข้อมูลล้มเหลว:', health.message);
  }
}, 5 * 60 * 1000);

// Initialize UserModel
// const userModel = new UserModel(pool);

// Graceful shutdown function
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  pool.end().then(() => {
    console.log('Database pool has ended');
    process.exit(0);
  }).catch((err) => {
    console.error('Error during database pool shutdown:', err);
    process.exit(1);
  });
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Rejection:', error);
  gracefulShutdown('unhandledRejection');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});