const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { UserModel } = require('./models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
app.post('/api/auth', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findByUsername(username);

    if (!user) {
      const error = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง') as any;
error.status = 401;
throw error;
    }

    const isValidPassword = await userModel.validatePassword(password, user.password);
    if (!isValidPassword) {
      const error = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง') as any;
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

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
  });