import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle JWT specific errors
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      message: 'Token ไม่ถูกต้อง',
      error: 'INVALID_TOKEN'
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      message: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่',
      error: 'TOKEN_EXPIRED'
    });
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      message: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'ข้อมูลไม่ถูกต้อง',
      error: 'VALIDATION_ERROR',
      details: err.message
    });
  }

  // Handle custom errors with status
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
      error: err.name
    });
  }

  // Default error
  return res.status(500).json({
    message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
    error: 'INTERNAL_SERVER_ERROR'
  });
};