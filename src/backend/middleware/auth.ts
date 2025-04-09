import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: number;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }

    jwt.verify(token, JWT_SECRET, (err: unknown, decoded: unknown) => {
      if (err instanceof Error) { // ✅ ตรวจสอบ error อย่างถูกต้อง
        return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
      }

      // ✅ ตรวจสอบว่า `decoded` ตรงกับ `UserPayload`
      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'username' in decoded && 'role' in decoded) {
        req.user = decoded as UserPayload; // ✅ ใช้ Type Assertion อย่างปลอดภัย
        next();
      } else {
        return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
      }
    });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ Token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'ไม่มีสิทธิ์ในการเข้าถึง' });
  }
  next();
};