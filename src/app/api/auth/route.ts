import { NextRequest, NextResponse } from 'next/server';
import {pool} from '@/backend/config/database';
import UserModel from '@/backend/models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const userModel = new UserModel(pool);
const JWTSECRET = process.env.JWTSECRET || 'your-secret-key';





export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    console.log("Received username:", username);
    console.log("Received password:", password);



    const user = await userModel.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { message: 'ชื่อผู้ใช้ไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const isValidPassword = await userModel.validatePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWTSECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // ตรวจสอบประเภทของข้อผิดพลาด
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          { message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล กรุณาลองใหม่อีกครั้ง' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}