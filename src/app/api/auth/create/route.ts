import { NextRequest, NextResponse } from 'next/server';
import {pool} from '@/backend/config/database';
import UserModel from '@/backend/models/User';
import jwt from 'jsonwebtoken';

const userModel = new UserModel(pool);
const JWTSECRET = process.env.JWTSECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบและถอดรหัส token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWTSECRET) as { role: string };
    } catch (error) {
        console.log(error)
      return NextResponse.json(
        { message: 'Token ไม่ถูกต้องหรือหมดอายุ' },
        { status: 403 }
      );
    }

    // ตรวจสอบสิทธิ์ admin
    if (decodedToken.role !== 'admin') {
      return NextResponse.json(
        { message: 'ไม่มีสิทธิ์ในการสร้างผู้ใช้' },
        { status: 403 }
      );
    }

    const { username, password, role } = await request.json();

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่แล้วหรือไม่
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      );
    }

    // สร้างผู้ใช้ใหม่
    const newUser = await userModel.createUser(username, password, role);
    
    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      user: {
        username: newUser.username,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' },
      { status: 500 }
    );
  }
}