import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import UserModel from './models/User';
import jwt from 'jsonwebtoken';                                                                          
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';

// Configure static file serving
const publicPath = path.join(__dirname, '../../public');


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));


const pool = new Pool({
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      console.log('Connected to PostgreSQL database');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection error:', err);
    throw new Error('Database connection failed');
  }
}

testDatabaseConnection().catch(err => {
  console.error('Failed to establish initial database connection:', err);
  process.exit(1);
});

// Initialize UserModel
const userModel = new UserModel(pool);

// Authentication route
interface AuthError extends Error {
  status?: number;
}

app.post('/api/auth', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);

    if (!user) {
      const error: AuthError = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      error.status = 401;
      throw error;
    }

    const isValidPassword = await userModel.validatePassword(password, user.password);
    if (!isValidPassword) {
      const error: AuthError = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add error handling middleware
app.use(errorHandler);

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